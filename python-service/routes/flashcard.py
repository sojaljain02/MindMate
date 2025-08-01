from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from services.flashcard_generator import FlashcardGenerator

router = APIRouter()
flashcard_generator = FlashcardGenerator()

class FlashcardGenerateRequest(BaseModel):
    text: str
    count: int = 10

class Card(BaseModel):
    front: str
    back: str

class FlashcardGenerateResponse(BaseModel):
    title: str
    cards: List[Card]

@router.post("/flashcards/generate", response_model=FlashcardGenerateResponse)
async def generate_flashcards(request: FlashcardGenerateRequest):
    try:
        if not request.text or len(request.text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Text too short for flashcard generation")
        
        flashcards_data = flashcard_generator.generate_flashcards(
            text=request.text,
            count=request.count
        )
        
        return FlashcardGenerateResponse(**flashcards_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
