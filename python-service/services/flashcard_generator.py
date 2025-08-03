import spacy
import random
from typing import List, Dict

class FlashcardGenerator:
    """
    A class to generate flashcards from a given text.
    It identifies named entities as terms (front) and uses their
    containing sentences as definitions (back).
    
    This class is named in PascalCase to follow Python conventions and
    resolve the ImportError.
    """
    def __init__(self):
        """
        Initializes the FlashcardGenerator by loading the spaCy model.
        It will download the model if it is not found.
        """
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Downloading required spaCy model 'en_core_web_sm'...")
            print("This is a one-time setup and may take a moment.")
            spacy.cli.download("en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")

    def _create_cards_from_entities(self, doc) -> List[Dict[str, str]]:
        """
        Private helper method to extract entities and form flashcards.
        """
        flashcards = []
        used_entities = set() # To avoid duplicate cards for the same term

        for sentence in doc.sents:
            if sentence.ents:
                for entity in sentence.ents:
                    # Use the entity text as the front of the card
                    term = entity.text.strip()
                    
                    # Skip if we've already made a card for this term
                    if term.lower() in used_entities:
                        continue
                        
                    # Use the full sentence as the back of the card
                    definition = sentence.text.strip()
                    
                    flashcards.append({"front": term, "back": definition})
                    used_entities.add(term.lower())
        
        return flashcards

    def generate_flashcards(self, text: str, num_cards: int = 10) -> List[Dict[str, str]]:
        """
        Generates a list of flashcards from the input text.

        Args:
            text (str): The text to process.
            num_cards (int): The maximum number of flashcards to return.

        Returns:
            List[Dict[str, str]]: A list of flashcard dictionaries, 
                                  each with a 'front' and 'back' key.
        """
        if not text or not isinstance(text, str):
            return []

        doc = self.nlp(text)
        
        all_possible_cards = self._create_cards_from_entities(doc)
        
        # Shuffle the cards to get a random selection
        random.shuffle(all_possible_cards)
        
        # Return the requested number of cards
        return all_possible_cards[:num_cards]

# --- Example Usage Block ---
# This block of code will ONLY run if you execute this file directly.
# It will NOT run if you import the FlashcardGenerator class into another script.
if __name__ == "__main__":
    
    # 1. Define sample text for the demonstration
    sample_text = """
    The Eiffel Tower, located in Paris, France, was completed in 1889. 
    It was designed by the engineer Gustave Eiffel. The tower stands 330 meters tall.
    Another famous landmark, the Statue of Liberty in New York City, was a gift from France to the United States.
    It was dedicated in 1886. The Statue of Liberty was designed by Frédéric Auguste Bartholdi. 
    George Washington was the first President of the United States, serving from 1789 to 1797.
    Abraham Lincoln, the 16th U.S. President, issued the Emancipation Proclamation in 1863.
    """

    # 2. Create an instance of the generator
    generator = FlashcardGenerator()

    # 3. Generate and print an example set of flashcards
    print("--- DEMO: GENERATING 5 FLASHCARDS ---")
    flashcards = generator.generate_flashcards(sample_text, num_cards=5)
    
    if not flashcards:
        print("Could not generate flashcards. The text may be too short or lack recognizable entities.")
    else:
        for i, card in enumerate(flashcards, 1):
            print(f"\n--- Card {i} ---")
            print(f"Front: {card['front']}")
            print(f"Back: {card['back']}")
            
    print("\n--- DEMO FINISHED ---")
    print("To use this in your own project, import the FlashcardGenerator class from this file.")

