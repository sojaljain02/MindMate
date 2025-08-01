import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PORT = int(os.getenv("PORT", 8000))
    MODEL_CACHE_DIR = os.getenv("MODEL_CACHE_DIR", "./models")
    
    # Model configurations
    SUMMARIZATION_MODEL = "facebook/bart-large-cnn"
    QA_MODEL = "deepset/roberta-base-squad2"
    
    # Summary length configurations
    SUMMARY_LENGTHS = {
        "short": {"max_length": 100, "min_length": 30},
        "medium": {"max_length": 200, "min_length": 50},
        "long": {"max_length": 400, "min_length": 100}
    }

settings = Settings()
