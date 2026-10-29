"""
Medha AI - University Student Assistant Microservice.
Provides FastAPI service running on Port 8000.
Integrates Spring Boot authorized student data, dedicated vector store RAG,
and faculty escalation workflows.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, documents
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
log = logging.getLogger(__name__)

app = FastAPI(
    title="Medha AI - University Student Assistant",
    description="Intelligent AI student assistant providing policy Q&A, authorized live student records, syllabus guidance, and faculty escalation.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, tags=["Chatbot & Student Assistant"])
app.include_router(documents.router, tags=["Knowledge Base & RAG Documents"])

@app.get("/health")
def health_check():
    return {
        "service": "university-ai-service",
        "assistant_name": "Medha AI",
        "status": "UP",
        "port": 8000,
        "capabilities": [
            "University Policy & Syllabus RAG",
            "Authorized Student Attendance & Results",
            "Class Timetable & Schedule",
            "LMS Assignments & Learning Resources",
            "Tuition Fees & Scholarships",
            "Placements & Library Services",
            "Faculty / Staff Escalation Support"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
