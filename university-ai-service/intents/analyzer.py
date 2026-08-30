from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
from models.schemas import IntentClassification, IntentEnum
from prompts.templates import INTENT_SYSTEM_PROMPT
from config.settings import GROQ_API_KEY, MODEL_NAME
import logging

log = logging.getLogger(__name__)

class IntentAnalyzer:
    def __init__(self):
        try:
            # init llm for structured output
            self.llm = ChatGroq(
                groq_api_key=GROQ_API_KEY,
                model_name=MODEL_NAME,
                temperature=0.0, # 0 temp for deterministic classification
                max_tokens=150
            ).with_structured_output(IntentClassification)
        except Exception as e:
            log.error(f"failed to init IntentAnalyzer: {e}")
            self.llm = None

    def analyze_intent(self, msg: str) -> IntentEnum:
        if not self.llm:
            log.warning("llm not init, defaulting to general intent.")
            return IntentEnum.GENERAL
            
        try:
            msgs = [
                SystemMessage(content=INTENT_SYSTEM_PROMPT),
                HumanMessage(content=msg)
            ]
            
            res = self.llm.invoke(msgs)
            log.info(f"classified intent: {res.intent}")
            return res.intent
        except Exception as e:
            log.error(f"intent classification failed: {e}")
            return IntentEnum.GENERAL
