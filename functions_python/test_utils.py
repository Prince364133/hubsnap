import shared_utils
import sys

# Test text
sample_text = """
Python is a high-level, general-purpose programming language. Its design philosophy emphasizes code readability with the use of significant indentation.
Python is dynamically-typed and garbage-collected. It supports multiple programming paradigms, including structured (particularly procedural), object-oriented and functional programming.
CreatorOS is building a library-first integration to optimized performance and reduce costs.
"""

sample_html = """
<html><head><script>console.log('hi')</script></head><body><h1>Hello World</h1><p>This is a test.</p></body></html>
"""

def test():
    print("Testing clean_text...")
    cleaned = shared_utils.clean_text(sample_html)
    print(f"Cleaned: {repr(cleaned)}")

    print("\nTesting score_readability...")
    score = shared_utils.score_readability(sample_text)
    print(f"Readability Score: {score}")

    # These require models, so they might take time on first run
    print("\nTesting summarize_text (Sumy)...")
    summary = shared_utils.summarize_text(sample_text, sentences_count=1)
    print(f"Summary: {summary}")

    print("\nTesting extract_keywords (KeyBERT)...")
    try:
        keywords = shared_utils.extract_keywords(sample_text, top_n=3)
        print(f"Keywords: {keywords}")
    except Exception as e:
        print(f"KeyBERT failed (likely missing model or dependencies in this env): {e}")

if __name__ == "__main__":
    test()
