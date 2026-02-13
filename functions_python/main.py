from firebase_functions import https_fn
from firebase_admin import initialize_app
import shared_utils
import json

initialize_app()

@https_fn.on_request()
def process_text(req: https_fn.Request) -> https_fn.Response:
    """
    Unified endpoint for text processing utilities.
    Expects JSON body: {"action": "action_name", "text": "content", "params": {}}
    Actions: "extract_keywords", "summarize", "clean_text", "readability"
    """
    try:
        data = req.get_json()
        action = data.get("action")
        text = data.get("text")
        params = data.get("params", {})

        if not action or not text:
            return https_fn.Response(json.dumps({"error": "Missing action or text"}), status=400, mimetype="application/json")

        result = None
        if action == "extract_keywords":
            top_n = params.get("top_n", 5)
            result = shared_utils.extract_keywords(text, top_n=top_n)
        elif action == "summarize":
            sentences_count = params.get("sentences_count", 3)
            result = shared_utils.summarize_text(text, sentences_count=sentences_count)
        elif action == "clean_text":
            result = shared_utils.clean_text(text)
        elif action == "readability":
            result = shared_utils.score_readability(text)
        elif action == "analyze_content_history":
            # Expects "items": [{"text": "...", "date": "...", "type": "..."}]
            items = params.get("items", [])
            if not items:
                return https_fn.Response(json.dumps({"error": "No items provided"}), status=400, mimetype="application/json")
            
            from collections import Counter
            from datetime import datetime

            total = len(items)
            type_counts = Counter()
            dates = []
            readability_scores = []
            all_text_for_keywords = []

            for item in items:
                item_text = item.get("text", "")
                item_type = item.get("type", "unknown")
                item_date = item.get("date", "")
                
                type_counts[item_type] += 1
                if item_date:
                    dates.append(item_date)
                
                if item_text:
                    score = shared_utils.score_readability(item_text)
                    readability_scores.append(score)
                    # For keywords, sticking to titles/hooks might be faster than full scripts
                    all_text_for_keywords.append(item_text[:200]) 

            avg_readability = sum(readability_scores) / len(readability_scores) if readability_scores else 0
            
            # Frequency Analysis
            daily_counts = Counter()
            monthly_counts = Counter()
            yearly_counts = Counter()

            for date_str in dates:
                try:
                    # Simple ISO parsing (take first 10 chars YYYY-MM-DD for safety if full parse fails)
                    # But proper parsing is better. 
                    if len(date_str) >= 10:
                        day_key = date_str[:10] # YYYY-MM-DD
                        month_key = date_str[:7] # YYYY-MM
                        year_key = date_str[:4] # YYYY
                        
                        daily_counts[day_key] += 1
                        monthly_counts[month_key] += 1
                        yearly_counts[year_key] += 1
                except Exception:
                    continue

            # Key extraction on combined text (limited sample)
            combined_text = ". ".join(all_text_for_keywords)
            top_keywords = shared_utils.extract_keywords(combined_text, top_n=10) if combined_text else []

            result = {
                "total": total,
                "type_breakdown": dict(type_counts),
                "frequency_stats": {
                    "daily": dict(daily_counts),
                    "monthly": dict(monthly_counts),
                    "yearly": dict(yearly_counts)
                },
                "avg_readability": round(avg_readability, 2),
                "top_keywords": top_keywords,
            }
        else:
            return https_fn.Response(json.dumps({"error": "Invalid action"}), status=400, mimetype="application/json")

        return https_fn.Response(json.dumps({"result": result}), mimetype="application/json")

    except Exception as e:
        return https_fn.Response(json.dumps({"error": str(e)}), status=500, mimetype="application/json")
