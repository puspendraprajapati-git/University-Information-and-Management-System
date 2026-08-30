import os
from dotenv import load_dotenv

load_dotenv()

API_GATEWAY_URL = os.getenv("API_GATEWAY_URL", "http://localhost:5000/api")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "dummy_key_please_set_in_env_file")
MODEL_NAME = "openai/gpt-oss-20b"
