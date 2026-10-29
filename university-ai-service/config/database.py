"""
Database management module for University AI Microservice.
Provides clean PyMySQL connection pooling and repository functions
for managing chat sessions, messages, feedback, escalations, and RAG document chunks.
"""

import pymysql
import pymysql.cursors
import logging
from typing import Optional, List, Dict, Any
from config.settings import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

log = logging.getLogger(__name__)

def get_connection():
    """Establishes and returns a MySQL database connection."""
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

# ==========================================
# 1. Chat Sessions
# ==========================================

def create_session(user_id: Optional[int] = None) -> int:
    """Creates a new chat session and returns session_id."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO chat_sessions (user_id, status) VALUES (%s, %s)",
                (user_id, "ACTIVE")
            )
            return cursor.lastrowid
    finally:
        conn.close()

def get_session(session_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves session details by session_id."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT session_id, user_id, started_at, status FROM chat_sessions WHERE session_id = %s",
                (session_id,)
            )
            return cursor.fetchone()
    finally:
        conn.close()

def update_session_status(session_id: int, status: str) -> bool:
    """Updates the status of a chat session."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE chat_sessions SET status = %s WHERE session_id = %s",
                (status, session_id)
            )
            return cursor.rowcount > 0
    finally:
        conn.close()

def get_user_sessions(user_id: int, limit: int = 20) -> List[Dict[str, Any]]:
    """Fetches recent sessions for a specific student/user."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT session_id, user_id, started_at, status FROM chat_sessions WHERE user_id = %s ORDER BY started_at DESC LIMIT %s",
                (user_id, limit)
            )
            return cursor.fetchall()
    finally:
        conn.close()

# ==========================================
# 2. Chat Messages
# ==========================================

def save_message(session_id: int, sender: str, message_text: str) -> int:
    """Saves a message (USER, BOT, SYSTEM, FACULTY) and returns message_id."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO chat_messages (session_id, sender, message_text) VALUES (%s, %s, %s)",
                (session_id, sender, message_text)
            )
            return cursor.lastrowid
    finally:
        conn.close()

def get_session_messages(session_id: int, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves chronological messages for an active chat session."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT message_id, session_id, sender, message_text, created_at FROM chat_messages WHERE session_id = %s ORDER BY message_id ASC LIMIT %s",
                (session_id, limit)
            )
            return cursor.fetchall()
    finally:
        conn.close()

# ==========================================
# 3. Chat Feedback
# ==========================================

def save_feedback(message_id: int, rating: int, comment: Optional[str] = None) -> int:
    """Saves user rating/comment on an AI response."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO chat_feedback (message_id, rating, comment) VALUES (%s, %s, %s)",
                (message_id, rating, comment)
            )
            return cursor.lastrowid
    finally:
        conn.close()

# ==========================================
# 4. Chat Escalations
# ==========================================

def create_escalation(session_id: int, assigned_to: str, reason: Optional[str] = None) -> int:
    """Creates a human escalation ticket and updates session status to ESCALATED."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO chat_escalations (session_id, assigned_to, status) VALUES (%s, %s, %s)",
                (session_id, assigned_to, "OPEN")
            )
            escalation_id = cursor.lastrowid
            cursor.execute(
                "UPDATE chat_sessions SET status = %s WHERE session_id = %s",
                ("ESCALATED", session_id)
            )
            return escalation_id
    finally:
        conn.close()

def get_escalations(status: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetches escalation tickets for faculty and administrative review."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            if status:
                cursor.execute(
                    "SELECT escalation_id, session_id, assigned_to, status, created_at FROM chat_escalations WHERE status = %s ORDER BY escalation_id DESC",
                    (status,)
                )
            else:
                cursor.execute(
                    "SELECT escalation_id, session_id, assigned_to, status, created_at FROM chat_escalations ORDER BY escalation_id DESC"
                )
            return cursor.fetchall()
    finally:
        conn.close()

# ==========================================
# 5. Knowledge Documents & Chunks (RAG)
# ==========================================

def save_knowledge_document(title: str, document_type: str, file_path: Optional[str] = None, processing_status: str = "PROCESSED") -> int:
    """Stores a knowledge base document metadata record."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO knowledge_documents (title, document_type, file_path, processing_status) VALUES (%s, %s, %s, %s)",
                (title, document_type, file_path, processing_status)
            )
            return cursor.lastrowid
    finally:
        conn.close()

def save_document_chunks(document_id: int, chunks: List[Dict[str, Any]]) -> int:
    """Batch inserts text chunks for a document."""
    if not chunks:
        return 0
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = "INSERT INTO document_chunks (document_id, chunk_text, page_number) VALUES (%s, %s, %s)"
            vals = [(document_id, c["text"], c.get("page", 1)) for c in chunks]
            cursor.executemany(sql, vals)
            return len(chunks)
    finally:
        conn.close()

def count_knowledge_documents() -> int:
    """Returns the total number of knowledge documents registered."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total FROM knowledge_documents")
            res = cursor.fetchone()
            return res["total"] if res else 0
    finally:
        conn.close()

def get_all_knowledge_documents() -> List[Dict[str, Any]]:
    """Retrieves all registered knowledge documents with their chunk counts."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT d.document_id, d.title, d.document_type, d.file_path, d.processing_status,
                       COUNT(c.chunk_id) AS chunk_count
                FROM knowledge_documents d
                LEFT JOIN document_chunks c ON d.document_id = c.document_id
                GROUP BY d.document_id
                ORDER BY d.document_id ASC
            """)
            return cursor.fetchall()
    finally:
        conn.close()

def get_all_chunks() -> List[Dict[str, Any]]:
    """Retrieves all document chunks with their document title and type for vector indexing."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT c.chunk_id, c.document_id, c.chunk_text, c.page_number,
                       d.title AS document_title, d.document_type
                FROM document_chunks c
                JOIN knowledge_documents d ON c.document_id = d.document_id
                ORDER BY c.chunk_id ASC
            """)
            return cursor.fetchall()
    finally:
        conn.close()
