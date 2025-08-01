
import random
import re
from typing import List, Dict
import nltk
from nltk.tokenize import sent_tokenize
import spacy
from utils.text_processor import TextProcessor

try:
    nlp = spacy.load("en_core_web_sm")
except:
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")

class QuizGenerator:
    def __init__(self):
        self.text_processor = TextProcessor()

    def generate_quiz(self, text: str, num_questions: int = 10,
                     difficulty: str = "medium", question_types: List[str] = None) -> Dict:
        if question_types is None:
            question_types = ["multiple_choice", "true_false"]

        doc = nlp(text)
        sentences = [sent.text.strip() for sent in doc.sents if 8 < len(sent.text) < 180]

        entities = self._extract_entities(doc)
        key_concepts = self._extract_key_concepts(doc)

        questions = []

        if "multiple_choice" in question_types:
            questions.extend(self._generate_multiple_choice(sentences, entities, num_questions // 2))

        if "true_false" in question_types:
            questions.extend(self._generate_true_false(sentences, entities, num_questions // 2))

        random.shuffle(questions)

        return {
            "title": self._generate_title(text),
            "description": f"Quiz with {len(questions)} questions.",
            "questions": questions[:num_questions],
            "tags": key_concepts[:5]
        }

    def _extract_entities(self, doc) -> List[Dict]:
        return [{"text": ent.text, "label": ent.label_} for ent in doc.ents]

    def _extract_key_concepts(self, doc) -> List[str]:
        concepts = [token.text for token in doc if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop]
        freq = {}
        for word in concepts:
            freq[word] = freq.get(word, 0) + 1
        return sorted(freq, key=freq.get, reverse=True)[:10]

    def _generate_multiple_choice(self, sentences, entities, num) -> List[Dict]:
        questions = []
        for sent in sentences:
            doc = nlp(sent)
            for ent in doc.ents:
                if ent.label_ in ["PERSON", "ORG", "GPE", "DATE"]:
                    question = sent.replace(ent.text, "_____")
                    correct = ent.text
                    distractors = [e["text"] for e in entities if e["label"] == ent.label_ and e["text"] != correct]
                    distractors = list(set(distractors))[:3]
                    while len(distractors) < 3:
                        distractors.append(random.choice(["John Smith", "London", "2020"]))
                    options = [correct] + distractors[:3]
                    random.shuffle(options)
                    questions.append({
                        "question": f"Fill in the blank: {question}",
                        "type": "multiple_choice",
                        "options": options,
                        "correct_answer": correct,
                        "explanation": f"The correct answer is {correct}."
                    })
                    break
            if len(questions) >= num:
                break
        return questions

    def _generate_true_false(self, sentences, entities, num) -> List[Dict]:
        questions = []
        for sent in random.sample(sentences, min(len(sentences), num * 2)):
            is_true = random.random() > 0.5
            if is_true:
                questions.append({
                    "question": f"True or False: {sent}",
                    "type": "true_false",
                    "options": ["True", "False"],
                    "correct_answer": "True",
                    "explanation": "Directly from the source."
                })
            else:
                false_sent = self._modify_to_false(sent, entities)
                if false_sent:
                    questions.append({
                        "question": f"True or False: {false_sent}",
                        "type": "true_false",
                        "options": ["True", "False"],
                        "correct_answer": "False",
                        "explanation": f"Original: {sent}"
                    })
            if len(questions) >= num:
                break
        return questions

    def _modify_to_false(self, sentence, entities):
        for ent in entities:
            if ent["text"] in sentence:
                fake = random.choice(["XYZ", "1999", "Unknown Corp"])
                return sentence.replace(ent["text"], fake)
        return None

    def _generate_title(self, text: str) -> str:
        doc = nlp(text[:300])
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PERSON", "GPE"]:
                return f"Quiz: {ent.text}"
        for chunk in doc.noun_chunks:
            if 5 < len(chunk.text) < 30:
                return f"Quiz: {chunk.text.title()}"
        return "Generated Quiz"
