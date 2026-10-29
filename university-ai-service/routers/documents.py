"""
Knowledge Documents and RAG Ingestion Router.
Provides endpoints for administrators and faculty to upload policy PDFs,
syllabus outlines, and campus notices for the AI Assistant's vector knowledge base.
"""

import os
import shutil
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
from config.settings import DOCUMENTS_UPLOAD_DIR
from config.database import get_all_knowledge_documents
from services.assistant_service import AssistantService

log = logging.getLogger(__name__)
router = APIRouter()
assistant_service = AssistantService()

@router.get("/documents")
async def list_documents():
    """Returns all registered knowledge documents and chunk stats."""
    try:
        docs = get_all_knowledge_documents()
        return {"total": len(docs), "documents": docs}
    except Exception as e:
        log.error(f"Error fetching documents: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve knowledge documents.")

@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    document_type: str = Form("POLICY")
):
    """
    Uploads a PDF or text document, parses pages into chunks,
    persists records into MySQL knowledge_documents, and indexes embeddings into vector store.
    """
    if not file.filename.lower().endswith((".pdf", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF and TXT documents are supported.")

    file_dest = os.path.join(DOCUMENTS_UPLOAD_DIR, file.filename)
    try:
        with open(file_dest, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Ingest into RAG pipeline
        doc_id = assistant_service.rag_service.ingest_pdf(
            file_path=file_dest,
            title=title,
            document_type=document_type
        )

        return {
            "status": "SUCCESS",
            "document_id": doc_id,
            "title": title,
            "filename": file.filename,
            "message": "Document successfully ingested and indexed into RAG vector store."
        }
    except Exception as e:
        log.error(f"Failed to ingest document: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")
