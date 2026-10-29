import logging
from config.settings import GROQ_API_KEY, MODEL_NAME
from models.schemas import IntentClassification, IntentEnum
from prompts.templates import INTENT_SYSTEM_PROMPT

log = logging.getLogger(__name__)

class IntentAnalyzer:
    def __init__(self):
        try:
            from langchain_groq import ChatGroq
            self.llm = ChatGroq(
                groq_api_key=GROQ_API_KEY,
                model_name=MODEL_NAME,
                temperature=0.0,
                max_tokens=150
            ).with_structured_output(IntentClassification)
        except Exception as e:
            log.error(f"failed to init IntentAnalyzer: {e}")
            self.llm = None

    def _keyword_intent(self, text: str) -> IntentEnum:
        msg = text.lower()
        if any(w in msg for w in ["attend", "absent", "presence"]):
            return IntentEnum.ATTENDANCE
        if any(w in msg for w in ["result", "grade", "marks", "gpa", "cgpa", "score"]):
            return IntentEnum.RESULTS
        if any(w in msg for w in ["fee", "payment", "due", "tuition"]):
            return IntentEnum.FEES
        if any(w in msg for w in ["event", "fest", "seminar", "workshop"]):
            return IntentEnum.EVENTS
        if any(w in msg for w in ["subject", "syllabus", "course"]):
            return IntentEnum.SUBJECTS
        if any(w in msg for w in ["department", "branch"]):
            return IntentEnum.DEPARTMENTS
        if any(w in msg for w in ["semester", "term"]):
            return IntentEnum.SEMESTERS
        if any(w in msg for w in ["faculty", "teacher", "professor"]):
            return IntentEnum.FACULTY
        if any(w in msg for w in ["profile", "my info", "who am i", "my detail"]):
            return IntentEnum.PROFILE
        if any(w in msg for w in ["admit", "admission", "apply", "eligibility"]):
            return IntentEnum.ADMISSIONS
        if any(w in msg for w in ["library", "book", "borrow"]):
            return IntentEnum.LIBRARY
        if any(w in msg for w in ["contact", "phone", "email", "helpdesk"]):
            return IntentEnum.CONTACT
        if any(w in msg for w in ["campus", "hostel", "sports", "cafeteria"]):
            return IntentEnum.CAMPUS
        return IntentEnum.GENERAL

    def analyze_intent(self, msg: str) -> IntentEnum:
        if self.llm:
            try:
                from langchain_core.messages import SystemMessage, HumanMessage
                msgs = [
                    SystemMessage(content=INTENT_SYSTEM_PROMPT),
                    HumanMessage(content=msg)
                ]
                res = self.llm.invoke(msgs)
                log.info(f"classified intent: {res.intent}")
                return res.intent
            except Exception as e:
                log.error(f"intent classification failed: {e}")

        fallback = self._keyword_intent(msg)
        log.info(f"fallback intent: {fallback}")
        return fallback
