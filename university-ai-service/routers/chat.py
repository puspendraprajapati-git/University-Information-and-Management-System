from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.chat_service import ChatService
import logging

log = logging.getLogger(__name__)
router = APIRouter()
chat_svc = ChatService()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    # Process incoming chat messages via the chat service
    try:
        res = chat_svc.process_chat(req)
        return res
    except Exception as e:
        log.error(f"error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="internal server error while processing ai response")
