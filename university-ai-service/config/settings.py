import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# API Gateway & Backend Services
GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost:5000")
API_GATEWAY_URL = os.getenv("API_GATEWAY_URL", f"{GATEWAY_URL}/api")

# LLM Configuration (Groq / Open-source)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL_NAME = os.getenv("MODEL_NAME", "openai/gpt-oss-20b")

# MySQL Shared Database Connection
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root@123")
DB_NAME = os.getenv("DB_NAME", "university_db")

# Vector Store Storage Directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VECTOR_STORE_DIR = os.getenv("VECTOR_STORE_DIR", os.path.join(BASE_DIR, "vector_store_data"))
DOCUMENTS_UPLOAD_DIR = os.getenv("DOCUMENTS_UPLOAD_DIR", os.path.join(BASE_DIR, "uploaded_docs"))

# Ensure storage directories exist
os.makedirs(VECTOR_STORE_DIR, exist_ok=True)
os.makedirs(DOCUMENTS_UPLOAD_DIR, exist_ok=True)
