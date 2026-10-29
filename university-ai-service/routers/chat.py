"""
Chatbot REST Router for Medha AI Student Assistant.
Provides endpoints for:
- Main conversation processing (/chat)
- User feedback submission (/chat/feedback)
- Faculty / staff escalations (/chat/escalate, /chat/escalations)
- Session history retrieval (/chat/history/{session_id})
"""

import logging
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from models.schemas import ChatRequest, ChatResponse, FeedbackRequest, EscalationRequest
from services.assistant_service import AssistantService
from config.database import (
    save_feedback, create_escalation, get_escalations, get_session_messages, get_user_sessions
)

log = logging.getLogger(__name__)
router = APIRouter()
assistant_service = AssistantService()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    """
    Main conversational endpoint for the AI Student Assistant.
    Coordinates intent extraction, authorized live Spring Boot data,
    RAG vector search, and faculty escalation.
    """
    try:
        res = assistant_service.handle_chat(
            message=req.message,
            token=req.token,
            session_id=req.session_id
        )
        return ChatResponse(**res)
    except Exception as e:
        log.error(f"Error in chat endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error processing student assistant response.")

@router.post("/chat/feedback")
async def submit_feedback(req: FeedbackRequest):
    """Submits user rating and review on an AI assistant response."""
    try:
        feedback_id = save_feedback(
            message_id=req.message_id,
            rating=req.rating,
            comment=req.comment
        )
        return {"status": "SUCCESS", "feedback_id": feedback_id, "message": "Feedback submitted successfully."}
    except Exception as e:
        log.error(f"Error recording feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to save chat feedback.")

@router.post("/chat/escalate")
async def escalate_session(req: EscalationRequest):
    """Manually creates an escalation ticket to faculty or university support."""
    try:
        escalation_id = create_escalation(
            session_id=req.session_id,
            assigned_to=req.assigned_to,
            reason=req.reason
        )
        return {
            "status": "ESCALATED",
            "escalation_id": escalation_id,
            "ticket_id": f"ESC-{escalation_id:04d}",
            "assigned_to": req.assigned_to,
            "message": "Ticket created and forwarded to university staff."
        }
    except Exception as e:
        log.error(f"Error creating escalation: {e}")
        raise HTTPException(status_code=500, detail="Failed to create escalation ticket.")

@router.get("/chat/escalations")
async def list_escalations(status: Optional[str] = Query(None)):
    """Retrieves all open or filtered escalation tickets for faculty dashboard."""
    try:
        tickets = get_escalations(status=status)
        return {"total": len(tickets), "escalations": tickets}
    except Exception as e:
        log.error(f"Error fetching escalations: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve escalations.")

@router.get("/chat/history/{session_id}")
async def get_history(session_id: int):
    """Retrieves message history for a specific conversation session."""
    try:
        messages = get_session_messages(session_id=session_id)
        return {"session_id": session_id, "messages": messages}
    except Exception as e:
        log.error(f"Error retrieving session history: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch conversation history.")

@router.get("/chat/sessions/{user_id}")
async def get_sessions(user_id: int):
    """Retrieves recent conversation sessions for a student."""
    try:
        sessions = get_user_sessions(user_id=user_id)
        return {"user_id": user_id, "sessions": sessions}
    except Exception as e:
        log.error(f"Error retrieving user sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch sessions.")
