import json
import logging
from config.settings import GROQ_API_KEY, MODEL_NAME
from models.schemas import IntentEnum, ChatRequest, ChatResponse
from intents.analyzer import IntentAnalyzer
from api_client.client import ApiClient
from utils.auth import extract_user_info_from_token
from prompts.templates import GENERATION_SYSTEM_PROMPT

log = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.analyzer = IntentAnalyzer()
        try:
            from langchain_groq import ChatGroq
            self.llm = ChatGroq(
                groq_api_key=GROQ_API_KEY,
                model_name=MODEL_NAME,
                temperature=0.7,
                max_tokens=500
            )
        except Exception as e:
            log.error(f"failed to init llm: {e}")
            self.llm = None

    def _get_profile_data(self, client, uid, role):
        if role in ('STUDENT', 'ROLE_STUDENT'):
            return client.get_student_profile(uid)
        elif role in ('FACULTY', 'ROLE_FACULTY'):
            return client.get_faculty_profile(uid)
        return {"error": "role not authorized"}

    def process_chat(self, req: ChatRequest) -> ChatResponse:
        user_info = extract_user_info_from_token(req.token)
        uid = user_info.get("userId")
        role = user_info.get("role")

        intent = self.analyzer.analyze_intent(req.message)
        client = ApiClient(req.token)
        ctx = {}

        # handle public intents first
        if intent == IntentEnum.GENERAL:
            ctx = {"note": "no backend data needed"}
        elif intent == IntentEnum.EVENTS:
            ctx = client.get_events()
        elif intent == IntentEnum.SUBJECTS:
            ctx = client.get_subjects()
        elif intent == IntentEnum.DEPARTMENTS:
            ctx = client.get_departments()
        elif intent == IntentEnum.SEMESTERS:
            ctx = client.get_semesters()
        elif intent == IntentEnum.FACULTY:
            ctx = client._get("/faculty")
        elif intent == IntentEnum.ADMISSIONS:
            ctx = {"info": "Admissions are currently open for the Fall semester. Apply online via the admissions portal before August 30. Requirements: high school diploma, minimum GPA 3.0."}
        elif intent == IntentEnum.LIBRARY:
            ctx = {"info": "The Central Library is open Mon-Fri 8AM-10PM, Weekends 10AM-6PM. Students can borrow up to 5 books for 14 days."}
        elif intent == IntentEnum.CONTACT:
            ctx = {"info": "Helpdesk: support@university.edu | Phone: +1-800-UNIV-HLP | Administration: admin@university.edu"}
        elif intent == IntentEnum.CAMPUS:
            ctx = {"info": "Main Campus features 5 academic blocks, a central library, 3 hostels, an indoor sports complex, and a sprawling cafeteria. Shuttle services run every 30 minutes."}
        else:
            # protected intents need a valid user id
            if not uid:
                ctx = {"error": "you must log in to access this info."}
            elif intent == IntentEnum.PROFILE:
                ctx = self._get_profile_data(client, uid, role)
            elif intent == IntentEnum.ATTENDANCE:
                if role in ('STUDENT', 'ROLE_STUDENT'):
                    profile = self._get_profile_data(client, uid, role)
                    sid = profile.get('studentId')
                    ctx = client.get_attendance(sid) if sid else {"error": "student profile not found"}
                else:
                    ctx = {"error": "only students can check attendance here"}
            elif intent == IntentEnum.RESULTS:
                if role in ('STUDENT', 'ROLE_STUDENT'):
                    profile = self._get_profile_data(client, uid, role)
                    sid = profile.get('studentId')
                    ctx = client.get_results(sid) if sid else {"error": "student profile not found"}
                else:
                    ctx = {"error": "only students can check results here"}
            elif intent in (IntentEnum.FEES, IntentEnum.TIMETABLE):
                ctx = {"info": f"{intent.value} is not ready yet in backend."}

        return self._generate(req.message, intent, ctx)

    def _fallback_reply(self, intent: IntentEnum, ctx: dict) -> str:
        if isinstance(ctx, dict) and "error" in ctx:
            return ctx["error"]
        if "info" in ctx:
            return ctx["info"]
        if intent == IntentEnum.DEPARTMENTS and isinstance(ctx, list) and ctx:
            return "University Departments:\n" + "\n".join([f"- {d.get('deptName', '')} ({d.get('deptCode', '')})" for d in ctx])
        if intent == IntentEnum.EVENTS and isinstance(ctx, list) and ctx:
            return "Upcoming Events:\n" + "\n".join([f"- {e.get('title', '')} on {e.get('eventDate', '')}" for e in ctx])
        return "Hi! I am EduCore-Bot. How can I help you today? You can ask me about admissions, campus facilities, library timings, departments, or your attendance and results."

    def _generate(self, msg: str, intent: IntentEnum, ctx: dict) -> ChatResponse:
        if self.llm:
            try:
                from langchain_core.messages import SystemMessage, HumanMessage
                ctx_str = json.dumps(ctx, indent=2)
                sys_prompt = GENERATION_SYSTEM_PROMPT.format(context=ctx_str)
                msgs = [
                    SystemMessage(content=sys_prompt),
                    HumanMessage(content=msg)
                ]
                res = self.llm.invoke(msgs)
                return ChatResponse(reply=res.content.strip())
            except Exception as e:
                log.error(f"error generating response: {e}")

        return ChatResponse(reply=self._fallback_reply(intent, ctx))
