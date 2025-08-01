from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.text_summarizer import TextSummarizer

router = APIRouter()
summarizer = TextSummarizer()

class SummarizeRequest(BaseModel):
    text: str
    length: str = "medium"

class SummarizeResponse(BaseModel):
    summary: str
    keywords: List[str]
    original_length: int
    summary_length: int

@router.post("/summarize", response_model=SummarizeResponse)
async def generate_summary(request: SummarizeRequest):
    try:
        if not request.text or len(request.text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Text too short for summarization")
        
        summary = summarizer.summarize(request.text, request.length)
        keywords = summarizer.extract_keywords(request.text)
        
        return SummarizeResponse(
            summary=summary,
            keywords=keywords,
            original_length=len(request.text.split()),
            summary_length=len(summary.split())
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
