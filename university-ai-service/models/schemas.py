from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class ChatRequest(BaseModel):
    message: str
    token: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str

class IntentEnum(str, Enum):
    PROFILE = "PROFILE"
    ATTENDANCE = "ATTENDANCE"
    RESULTS = "RESULTS"
    FEES = "FEES"
    EVENTS = "EVENTS"
    SUBJECTS = "SUBJECTS"
    TIMETABLE = "TIMETABLE"
    DEPARTMENTS = "DEPARTMENTS"
    SEMESTERS = "SEMESTERS"
    FACULTY = "FACULTY"
    ADMISSIONS = "ADMISSIONS"
    LIBRARY = "LIBRARY"
    CONTACT = "CONTACT"
    CAMPUS = "CAMPUS"
    GENERAL = "GENERAL"

class IntentClassification(BaseModel):
    intent: IntentEnum = Field(description="The classified intent of the user's message.")
