from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
log = logging.getLogger(__name__)

app = FastAPI(title="University AI Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, tags=["Chatbot"])

@app.get("/health")
def health_check():
    return {"status": "AI Microservice is up and running!"}

# uvicorn main:app --reload --port 8000
