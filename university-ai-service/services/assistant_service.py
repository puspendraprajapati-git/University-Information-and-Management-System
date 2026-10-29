"""
Medha AI - Student Assistant Service Orchestrator.
Seamlessly integrates:
1. Intent Analysis
2. Secure Authorized Live Student API Calls (Spring Boot Core, LMS, Exam, Placement, Library, Fee)
3. RAG Document & Policy Retrieval from Dedicated Vector Store
4. LLM Generation with Academic Advising Formatting
5. Chat Sessions, Messages, and Faculty Escalation Persistence
"""

import json
import logging
from typing import Optional, Dict, Any, List
from config.settings import GROQ_API_KEY, MODEL_NAME
from config.database import (
    create_session, get_session, save_message, create_escalation, update_session_status
)
from utils.auth import extract_user_info_from_token
from intents.student_intent_analyzer import StudentIntentAnalyzer, StudentIntent
from api_client.student_api_client import StudentApiClient
from services.vector_store import DedicatedVectorStore
from services.rag_service import RAGService
from services.document_seeder import seed_knowledge_base_if_needed
from prompts.assistant_prompts import (
    STUDENT_ASSISTANT_SYSTEM_PROMPT, UNAUTHENTICATED_WARNING, PRIVACY_VIOLATION_WARNING
)

log = logging.getLogger(__name__)

class AssistantService:
    def __init__(self):
        self.analyzer = StudentIntentAnalyzer()
        self.vector_store = DedicatedVectorStore()
        self.rag_service = RAGService(self.vector_store)

        # Seed knowledge base if not yet populated
        seed_knowledge_base_if_needed(self.vector_store)

        # Initialize Groq LLM
        self.llm = None
        if GROQ_API_KEY:
            try:
                from langchain_groq import ChatGroq
                self.llm = ChatGroq(
                    groq_api_key=GROQ_API_KEY,
                    model_name=MODEL_NAME,
                    temperature=0.6,
                    max_tokens=700
                )
                log.info(f"Initialized Medha AI LLM with model: {MODEL_NAME}")
            except Exception as e:
                log.warning(f"Could not initialize Groq LLM: {e}. Fallback generator will be used.")

    def handle_chat(self, message: str, token: Optional[str] = None, session_id: Optional[int] = None) -> Dict[str, Any]:
        """
        Main processing pipeline for student chat interactions:
        1. Resolves / creates persistent session.
        2. Logs user query into chat_messages.
        3. Identifies intent and authorization status.
        4. Calls authorized Spring Boot API for live student data (if personal).
        5. Performs RAG vector search for university policies, syllabus, or FAQs.
        6. Handles faculty escalation if requested or appropriate.
        7. Synthesizes response and persists bot reply.
        """
        user_info = extract_user_info_from_token(token)
        user_id = user_info.get("userId")
        role = user_info.get("role")

        # 1. Ensure a valid session exists
        if not session_id or not get_session(session_id):
            session_id = create_session(user_id=user_id)

        # 2. Record User Message
        user_msg_id = save_message(session_id, "USER", message)

        # 3. Classify User Intent
        intent, confidence = self.analyzer.analyze(message)
        log.info(f"Session #{session_id} - User: {user_id or 'Guest'} - Intent: {intent.value} ({confidence})")

        # Context containers
        student_data: Dict[str, Any] = {}
        rag_context_str: str = ""
        citations: List[Dict[str, Any]] = []
        escalation_data: Dict[str, Any] = {}
        is_escalated = False
        escalation_id = None

        client = StudentApiClient(token)

        # 4. Handle Live Data vs RAG based on Intent
        if intent in (StudentIntent.ATTENDANCE, StudentIntent.RESULTS, StudentIntent.TIMETABLE, StudentIntent.FEES):
            # Check security rule: Must be authenticated
            if not user_id or not token:
                reply = UNAUTHENTICATED_WARNING
                bot_msg_id = save_message(session_id, "BOT", reply)
                return {
                    "reply": reply,
                    "session_id": session_id,
                    "message_id": bot_msg_id,
                    "intent": intent.value,
                    "sources": [],
                    "escalated": False
                }

            # Resolve student profile strictly via Spring Boot
            profile = client.get_verified_student_profile(user_id)
            if not profile or not (profile.get("studentId") or profile.get("id")):
                student_data = {"error": "Student profile not found for this user account."}
            else:
                student_id = profile.get("studentId") or profile.get("id")
                student_data["profile"] = {
                    "name": profile.get("name"),
                    "enrollmentNo": profile.get("enrollmentNo") or profile.get("regNo"),
                    "semester": profile.get("currentSemester") or profile.get("semester", {}).get("semesterNumber", 1),
                    "department": profile.get("department", {}).get("name") if isinstance(profile.get("department"), dict) else "Engineering"
                }

                if intent == StudentIntent.ATTENDANCE:
                    student_data["attendance"] = client.get_live_attendance(student_id)
                    # Supplement with attendance policy from RAG
                    rag_context_str, citations = self.rag_service.retrieve_context("minimum attendance 75 percent condonation debarment", top_k=1)
                elif intent == StudentIntent.RESULTS:
                    student_data["results"] = client.get_live_results(student_id)
                    # Supplement with grading scale from RAG
                    rag_context_str, citations = self.rag_service.retrieve_context("grading scale CGPA evaluation standards", top_k=1)
                elif intent == StudentIntent.TIMETABLE:
                    sem_id = profile.get("currentSemester") or 1
                    student_data["timetable"] = client.get_live_timetable(semester_id=sem_id)
                elif intent == StudentIntent.FEES:
                    student_data["fees"] = client.get_student_fees(student_id)
                    rag_context_str, citations = self.rag_service.retrieve_context("tuition fee payment deadline late surcharge scholarship", top_k=1)

        elif intent == StudentIntent.ASSIGNMENTS:
            # Query active LMS assignments and learning resources
            student_data["assignments"] = client.get_lms_assignments()
            student_data["resources"] = client.get_lms_resources()
            rag_context_str, citations = self.rag_service.retrieve_context("assignments academic integrity plagiarism reference textbooks", top_k=1)

        elif intent == StudentIntent.LIBRARY:
            # Check if student is asking about personal loans vs catalog rules
            if user_id and token:
                profile = client.get_verified_student_profile(user_id)
                s_id = profile.get("studentId") or profile.get("id") if profile else None
                if s_id:
                    student_data["library"] = client.get_library_status(s_id)
            rag_context_str, citations = self.rag_service.retrieve_context(f"central library rules borrowing quota lending duration overdue fine {message}", top_k=2)

        elif intent == StudentIntent.PLACEMENTS:
            if user_id and token:
                profile = client.get_verified_student_profile(user_id)
                s_id = profile.get("studentId") or profile.get("id") if profile else None
                student_data["placement"] = client.get_placement_opportunities(s_id)
            else:
                student_data["placement"] = client.get_placement_opportunities()
            rag_context_str, citations = self.rag_service.retrieve_context("campus placement eligibility criteria dream company hiring regulations", top_k=1)

        elif intent == StudentIntent.EXAMS:
            rag_context_str, citations = self.rag_service.retrieve_context("examination conduct hall ticket eligibility weightage CIA SEE", top_k=2)

        elif intent in (StudentIntent.POLICY, StudentIntent.SYLLABUS):
            # Pure RAG Knowledge retrieval
            rag_context_str, citations = self.rag_service.retrieve_context(message, top_k=3)

        elif intent == StudentIntent.ESCALATE:
            # Determine appropriate department
            assigned_department = "FACULTY_ADVISOR"
            msg_lower = message.lower()
            if "fee" in msg_lower or "money" in msg_lower or "scholarship" in msg_lower:
                assigned_department = "FINANCE_AND_FEES_DESK"
            elif "exam" in msg_lower or "grade" in msg_lower or "revaluation" in msg_lower:
                assigned_department = "ACADEMIC_EXAM_CELL"
            elif "placement" in msg_lower or "job" in msg_lower:
                assigned_department = "PLACEMENT_CELL"

            escalation_id = create_escalation(session_id, assigned_department, reason=message)
            is_escalated = True
            escalation_data = {
                "ticket_id": f"ESC-{escalation_id:04d}",
                "assigned_to": assigned_department,
                "session_id": session_id,
                "status": "OPEN",
                "instructions": "Your query has been logged with university advisors. A support officer will review your conversation history and contact you."
            }

        else:
            # GENERAL: query RAG knowledge base for campus facilities, contacts, or notices
            rag_context_str, citations = self.rag_service.retrieve_context(message, top_k=2)

        # 5. Synthesize Response using LLM or Fallback Formatter
        reply = self._generate_response(
            message=message,
            intent=intent,
            student_data=student_data,
            rag_context=rag_context_str,
            escalation_data=escalation_data
        )

        # 6. Save Bot Reply
        bot_msg_id = save_message(session_id, "BOT", reply)

        return {
            "reply": reply,
            "session_id": session_id,
            "message_id": bot_msg_id,
            "intent": intent.value,
            "sources": citations,
            "escalated": is_escalated,
            "escalation_id": escalation_id
        }

    def _generate_response(
        self,
        message: str,
        intent: StudentIntent,
        student_data: Dict[str, Any],
        rag_context: str,
        escalation_data: Dict[str, Any]
    ) -> str:
        """Invokes Groq LLM or academic fallback generator."""
        if self.llm:
            try:
                from langchain_core.messages import SystemMessage, HumanMessage

                sys_prompt = STUDENT_ASSISTANT_SYSTEM_PROMPT.format(
                    student_data=json.dumps(student_data, indent=2) if student_data else "None",
                    rag_context=rag_context if rag_context else "None",
                    escalation_data=json.dumps(escalation_data, indent=2) if escalation_data else "None"
                )

                msgs = [
                    SystemMessage(content=sys_prompt),
                    HumanMessage(content=message)
                ]

                res = self.llm.invoke(msgs)
                return res.content.strip()
            except Exception as e:
                log.error(f"LLM Generation exception: {e}. Switching to deterministic fallback formatter.")

        return self._format_deterministic_response(intent, student_data, rag_context, escalation_data)

    def _format_deterministic_response(
        self,
        intent: StudentIntent,
        student_data: Dict[str, Any],
        rag_context: str,
        escalation_data: Dict[str, Any]
    ) -> str:
        """High-quality deterministic fallback response formatter."""
        if escalation_data:
            return (
                f"🎫 **Escalation Ticket #{escalation_data.get('ticket_id')} Created**\n\n"
                f"Your query has been escalated to **{escalation_data.get('assigned_to')}**.\n\n"
                f"• **Session Reference:** Session #{escalation_data.get('session_id')}\n"
                f"• **Status:** Active / Open\n\n"
                f"A university staff member or faculty advisor will review your conversation history and follow up with you directly. You can also view updates in your campus portal."
            )

        if intent == StudentIntent.ATTENDANCE and "attendance" in student_data:
            att = student_data["attendance"]
            prof = student_data.get("profile", {})
            pct = att.get("overall_percentage", 0.0)
            status_emoji = "✅" if pct >= 75.0 else "⚠️"

            lines = [
                f"📊 **Live Attendance Summary for {prof.get('name', 'Student')}**",
                f"**Overall Aggregate:** {status_emoji} **{pct}%** ({att.get('present_classes', 0)} / {att.get('total_classes', 0)} classes attended)\n"
            ]

            if att.get("is_below_75"):
                lines.append(
                    "⚠️ **Attendance Alert:** Your attendance is currently below the mandatory **75% threshold**. "
                    "Under academic regulations, you risk exam debarment unless you qualify for medical condonation (65%-74.9%). Please contact your faculty advisor.\n"
                )

            subjects = att.get("subjects", [])
            if subjects:
                lines.append("**Subject-wise Breakdown:**")
                for s in subjects:
                    sub_alert = "⚠️" if s.get("is_low") else "✓"
                    lines.append(f"• **{s.get('subject')}:** {sub_alert} {s.get('percentage')}% ({s.get('present')}/{s.get('total')})")

            lines.append("\n*[Source: University Academic Regulations 2026 - Section 1]*")
            return "\n".join(lines)

        if intent == StudentIntent.RESULTS and "results" in student_data:
            res_data = student_data["results"]
            prof = student_data.get("profile", {})
            results_list = res_data.get("results", [])

            lines = [
                f"🎓 **Examination Results for {prof.get('name', 'Student')}**",
                f"**Enrollment No:** `{prof.get('enrollmentNo', '-')}`\n"
            ]

            if not results_list:
                lines.append("No published semester exam results were found on your record yet.")
            else:
                lines.append("| Subject | Marks | Grade | Status |")
                lines.append("| :--- | :--- | :--- | :--- |")
                for r in results_list:
                    sub = r.get("subject", {}).get("subjectName") if isinstance(r.get("subject"), dict) else r.get("subjectName", "Subject")
                    marks = r.get("marksObtained", "-")
                    grade = r.get("grade", "-")
                    status = r.get("status", "PASS")
                    lines.append(f"| {sub} | {marks} | **{grade}** | {status} |")

            lines.append("\n*[Source: University Examination Evaluation Standards (10-point CGPA scale)]*")
            return "\n".join(lines)

        if intent == StudentIntent.TIMETABLE and "timetable" in student_data:
            tt = student_data["timetable"]
            slots = tt.get("slots", [])
            lines = ["📅 **Current Semester Class Timetable**\n"]
            if not slots:
                lines.append("No active timetable slots scheduled for your current semester today.")
            else:
                lines.append("| Day | Time Slot | Subject | Room / Venue |")
                lines.append("| :--- | :--- | :--- | :--- |")
                for s in slots[:6]:
                    day = s.get("dayOfWeek", "Weekday")
                    time = f"{s.get('startTime', '')} - {s.get('endTime', '')}"
                    sub = s.get("subjectName") or (s.get("subject", {}).get("subjectName") if isinstance(s.get("subject"), dict) else "Lecture")
                    room = s.get("roomNumber") or s.get("room") or "Classroom"
                    lines.append(f"| {day} | {time} | {sub} | {room} |")

            return "\n".join(lines)

        if intent == StudentIntent.FEES and "fees" in student_data:
            fee_info = student_data["fees"]
            pending = fee_info.get("pending_amount", 0.0)
            invoices = fee_info.get("invoices", [])

            lines = [
                "💳 **University Tuition & Fees Overview**",
                f"**Outstanding Balance:** {'₹' + str(pending) if pending > 0 else '✅ All Clear (₹0.00)'}\n"
            ]

            if invoices:
                lines.append("**Recent Semester Invoices:**")
                for inv in invoices[:3]:
                    amt = inv.get("totalAmount") or inv.get("amount")
                    st = inv.get("status", "PENDING")
                    due = inv.get("dueDate", "Soon")
                    lines.append(f"• Invoice #{inv.get('invoiceId') or inv.get('id')}: ₹{amt} ({st}) - Due: {due}")

            lines.append("\nFee payments can be settled online via the Razorpay payment gateway on your student portal.")
            lines.append("*[Source: Tuition Fees, Invoicing & Scholarship Guidelines 2026]*")
            return "\n".join(lines)

        if rag_context:
            return (
                f"📚 **University Knowledge & Policy Guidance**\n\n"
                f"{rag_context}\n\n"
                f"If you need further clarification or individualized academic accommodation, feel free to ask me to escalate this to your faculty advisor."
            )

        return (
            "Hello! I am **Medha AI**, your university student assistant. 🎓\n\n"
            "Here are some things I can assist you with:\n"
            "• **My Attendance**: Check your live attendance percentage & verify the 75% rule.\n"
            "• **My Results**: View your latest semester grades and CGPA scorecard.\n"
            "• **Timetable**: View lecture hours and room locations.\n"
            "• **Assignments & LMS**: Review active homework and study resources.\n"
            "• **Fees & Scholarships**: Invoices, payment deadlines, and financial aid.\n"
            "• **Placements & Library**: Active campus drives, book search, and overdue fines.\n"
            "• **Policies & Syllabus**: Official attendance condonation, course modules, and notices.\n\n"
            "How can I assist you today?"
        )
