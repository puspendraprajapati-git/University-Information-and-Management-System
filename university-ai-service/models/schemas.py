"""
Pydantic Schemas for University AI Assistant.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ChatRequest(BaseModel):
    message: str
    token: Optional[str] = None
    session_id: Optional[int] = None

class SourceCitation(BaseModel):
    source_title: str
    document_type: str
    page: Optional[int] = 1
    score: Optional[float] = 0.0

class ChatResponse(BaseModel):
    reply: str
    session_id: Optional[int] = None
    message_id: Optional[int] = None
    intent: Optional[str] = None
    sources: Optional[List[Dict[str, Any]]] = []
    escalated: Optional[bool] = False
    escalation_id: Optional[int] = None

class FeedbackRequest(BaseModel):
    message_id: int
    rating: int = Field(ge=1, le=5, description="Rating from 1 to 5")
    comment: Optional[str] = None

class EscalationRequest(BaseModel):
    session_id: int
    assigned_to: str = "FACULTY_ADVISOR"
    reason: Optional[str] = None
