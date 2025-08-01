import re
import nltk
from typing import List, Dict
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords

class TextProcessor:
    def __init__(self):
        # Download required NLTK data
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
        except:
            pass
        
        self.stop_words = set(stopwords.words('english'))
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.\,\!\?\-\:\;]', '', text)
        # Fix spacing around punctuation
        text = re.sub(r'\s+([.!?,])', r'\1', text)
        return text.strip()
    
    def extract_sentences(self, text: str) -> List[str]:
        """Extract sentences from text"""
        text = self.clean_text(text)
        return sent_tokenize(text)
    
    def extract_keywords(self, text: str, num_keywords: int = 10) -> List[str]:
        """Extract keywords from text"""
        text = self.clean_text(text.lower())
        tokens = word_tokenize(text)
        
        # Filter tokens
        filtered_tokens = [
            token for token in tokens 
            if token.isalnum() and 
            token not in self.stop_words and 
            len(token) > 3
        ]
        
        # Count frequency
        word_freq = {}
        for word in filtered_tokens:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word[0] for word in sorted_words[:num_keywords]]
    
    def chunk_text(self, text: str, chunk_size: int = 500) -> List[str]:
        """Split text into chunks"""
        sentences = self.extract_sentences(text)
        chunks = []
        current_chunk = []
        current_size = 0
        
        for sentence in sentences:
            sentence_size = len(sentence.split())
            if current_size + sentence_size > chunk_size and current_chunk:
                chunks.append(' '.join(current_chunk))
                current_chunk = [sentence]
                current_size = sentence_size
            else:
                current_chunk.append(sentence)
                current_size += sentence_size
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def extract_entities_simple(self, text: str) -> Dict[str, List[str]]:
        """Simple entity extraction without spaCy"""
        entities = {
            "dates": [],
            "numbers": [],
            "capitalized": []
        }
        
        # Extract dates (simple patterns)
        date_patterns = [
            r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
            r'\b\d{4}\b',
            r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b'
        ]
        for pattern in date_patterns:
            entities["dates"].extend(re.findall(pattern, text))
        
        # Extract numbers
        entities["numbers"] = re.findall(r'\b\d+\.?\d*\b', text)
        
        # Extract capitalized words (potential entities)
        words = word_tokenize(text)
        entities["capitalized"] = [
            word for word in words 
            if word[0].isupper() and 
            word.lower() not in self.stop_words and
            len(word) > 2
        ]
        
        return entities
