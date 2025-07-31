from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import re
from typing import List
from config import settings

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
except:
    pass

class TextSummarizer:
    def __init__(self):
        self.model_name = settings.SUMMARIZATION_MODEL
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)
        self.summarizer = pipeline(
            "summarization",
            model=self.model,
            tokenizer=self.tokenizer,
            device=-1  # Use CPU, set to 0 for GPU
        )
    
    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.\,\!\?\-]', '', text)
        return text.strip()
    
    def summarize(self, text: str, length: str = "medium") -> str:
        """Generate summary of given text"""
        text = self.preprocess_text(text)
        
        # Get length parameters
        length_params = settings.SUMMARY_LENGTHS.get(length, settings.SUMMARY_LENGTHS["medium"])
        
        # Split text into chunks if too long
        max_chunk_size = 1024
        chunks = self._split_text(text, max_chunk_size)
        
        summaries = []
        for chunk in chunks:
            summary = self.summarizer(
                chunk,
                max_length=length_params["max_length"],
                min_length=length_params["min_length"],
                do_sample=False
            )
            summaries.append(summary[0]['summary_text'])
        
        # Combine summaries if multiple chunks
        final_summary = ' '.join(summaries)
        
        # If combined summary is too long, summarize again
        if len(final_summary.split()) > length_params["max_length"] * 1.5:
            final_summary = self.summarizer(
                final_summary,
                max_length=length_params["max_length"],
                min_length=length_params["min_length"],
                do_sample=False
            )[0]['summary_text']
        
        return final_summary
    
    def _split_text(self, text: str, max_size: int) -> List[str]:
        """Split text into chunks"""
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0
        
        for word in words:
            current_size += len(word) + 1
            if current_size > max_size:
                chunks.append(' '.join(current_chunk))
                current_chunk = [word]
                current_size = len(word)
            else:
                current_chunk.append(word)
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def extract_keywords(self, text: str, num_keywords: int = 5) -> List[str]:
        """Extract keywords from text"""
        text = self.preprocess_text(text.lower())
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords
        stop_words = set(stopwords.words('english'))
        filtered_tokens = [w for w in tokens if w.isalnum() and w not in stop_words and len(w) > 3]
        
        # Get word frequency
        word_freq = {}
        for word in filtered_tokens:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency and return top keywords
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        keywords = [word[0] for word in sorted_words[:num_keywords]]
        
        return keywords
