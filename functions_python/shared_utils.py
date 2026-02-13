import spacy
import textstat
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.text_rank import TextRankSummarizer
from keybert import KeyBERT
from bs4 import BeautifulSoup
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")

# Lazy loading globals
_nlp = None
_kw_model = None

def get_nlp():
    global _nlp
    if _nlp is None:
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            from spacy.cli import download
            download("en_core_web_sm")
            _nlp = spacy.load("en_core_web_sm")
    return _nlp

def get_kw_model():
    global _kw_model
    if _kw_model is None:
        _kw_model = KeyBERT()
    return _kw_model

def extract_keywords(text, top_n=5):
    """
    Extracts keywords using KeyBERT.
    """
    try:
        model = get_kw_model()
        keywords = model.extract_keywords(text, keyphrase_ngram_range=(1, 2), stop_words='english', top_n=top_n)
        return [kw[0] for kw in keywords]
    except Exception as e:
        print(f"Error in extract_keywords: {e}")
        return []

def summarize_text(text, sentences_count=3):
    """
    Summarizes text using Sumy (TextRank).
    """
    try:
        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        summarizer = TextRankSummarizer()
        summary = summarizer(parser.document, sentences_count)
        return " ".join([str(sentence) for sentence in summary])
    except Exception as e:
        print(f"Error in summarize_text: {e}")
        return text[:500] + "..." # Fallback

def score_readability(text):
    """
    Returns textstat reading ease score (Flesch Reading Ease).
    Returns float: 0-100 (higher is easier).
    """
    try:
        return textstat.flesch_reading_ease(text)
    except Exception as e:
        print(f"Error in score_readability: {e}")
        return 0.0

def clean_text(html_content):
    """
    Cleans HTML content using BeautifulSoup.
    """
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()
        text = soup.get_text()
        # Break into lines and remove leading/trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text = '\n'.join(chunk for chunk in chunks if chunk)
        return text
    except Exception as e:
        print(f"Error in clean_text: {e}")
        return html_content
