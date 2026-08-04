import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from typing import Optional
import requests
# Import LangChain components
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain.agents import create_agent

# Load environment variables (GROQ_API_KEY)
load_dotenv()

app = FastAPI(title="University AI Microservice")

# Enable CORS for API Gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the Groq LLM (Make sure GROQ_API_KEY is in .env)
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY environment variable is not set!")

llm = ChatGroq(
    groq_api_key=api_key,
    model_name="llama-3.1-8b-instant", # Lightning fast Llama-3.1 model
    temperature=0.7,
    max_tokens=500
)

# Request Model
class ChatRequest(BaseModel):
    message: str
    token: Optional[str] = None

# Response Model
class ChatResponse(BaseModel):
    reply: str

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Receives a message from the user, processes it through LangChain + Groq Agent,
    and returns the AI's response.
    """
    @tool
    def get_student_list() -> str:
        """Fetches the current list of students from the university database. Use this tool whenever the user asks for the student list."""
        if not request.token:
            return "No authentication token provided. Please log in."
        try:
            headers = {"Authorization": f"Bearer {request.token}"}
            resp = requests.get("http://localhost:8080/api/students", headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return f"Found {len(data)} students: " + ", ".join([f"{s.get('firstName')} {s.get('lastName')} (ID: {s.get('id')})" for s in data])
            else:
                return f"Error fetching students: {resp.status_code}"
        except Exception as e:
            return f"Exception while fetching students: {e}"

    @tool
    def get_faculty_list() -> str:
        """Fetches the current list of faculties from the university database. Use this tool whenever the user asks for the faculty list."""
        if not request.token:
            return "No authentication token provided. Please log in."
        try:
            headers = {"Authorization": f"Bearer {request.token}"}
            resp = requests.get("http://localhost:8080/api/faculty", headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return f"Found {len(data)} faculties: " + ", ".join([f"{s.get('firstName')} {s.get('lastName')} (ID: {s.get('id')})" for s in data])
            else:
                return f"Error fetching faculties: {resp.status_code}"
        except Exception as e:
            return f"Exception while fetching faculties: {e}"

    @tool
    def get_event_list() -> str:
        """Fetches the current list of events from the university database. Use this tool whenever the user asks for the event list."""
        if not request.token:
            return "No authentication token provided. Please log in."
        try:
            headers = {"Authorization": f"Bearer {request.token}"}
            resp = requests.get("http://localhost:8080/api/events", headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return f"Found {len(data)} events: " + ", ".join([f"{e.get('title')} on {e.get('date')}" for e in data])
            else:
                return f"Error fetching events: {resp.status_code}"
        except Exception as e:
            return f"Exception while fetching events: {e}"

    @tool
    def get_department_list() -> str:
        """Fetches the current list of departments from the university database. Use this tool whenever the user asks for the department list."""
        if not request.token:
            return "No authentication token provided. Please log in."
        try:
            headers = {"Authorization": f"Bearer {request.token}"}
            resp = requests.get("http://localhost:8080/api/departments", headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return f"Found {len(data)} departments: " + ", ".join([f"{d.get('name')} (ID: {d.get('id')})" for d in data])
            else:
                return f"Error fetching departments: {resp.status_code}"
        except Exception as e:
            return f"Exception while fetching departments: {e}"

    tools = [get_student_list, get_faculty_list, get_event_list, get_department_list]
    
    system_prompt = "You are EduCore-Bot, a helpful AI assistant for a University Portal. You help students, faculty, and admins with questions. Keep your answers concise, professional, and well-formatted. Use your tools if you need to fetch real-time data."
    
    agent = create_agent(llm, tools=tools, system_prompt=system_prompt)

    try:
        inputs = {"messages": [{"role": "user", "content": request.message}]}
        response = agent.invoke(inputs)
        reply = response["messages"][-1].content.strip()
        return ChatResponse(reply=reply)
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while processing AI response")

@app.get("/health")
def health_check():
    return {"status": "AI Microservice is running and ready!"}

# Run with: uvicorn main:app --reload --port 8000
