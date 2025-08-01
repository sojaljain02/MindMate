from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.quiz_generator import QuizGenerator

router = APIRouter()
quiz_generator = QuizGenerator()

class QuizGenerateRequest(BaseModel):
    text: str
    num_questions: int = 10
    difficulty: str = "medium"
    question_types: List[str] = ["multiple_choice", "true_false"]

class Question(BaseModel):
    question: str
    type: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None

class QuizGenerateResponse(BaseModel):
    title: str
    description: str
    questions: List[Question]
    tags: List[str]

@router.post("/quiz/generate", response_model=QuizGenerateResponse)
async def generate_quiz(request: QuizGenerateRequest):
    try:
        if not request.text or len(request.text.strip()) < 100:
            raise HTTPException(status_code=400, detail="Text too short for quiz generation")
        
        quiz_data = quiz_generator.generate_quiz(
            text=request.text,
            num_questions=request.num_questions,
            difficulty=request.difficulty,
            question_types=request.question_types
        )
        
        return QuizGenerateResponse(**quiz_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
