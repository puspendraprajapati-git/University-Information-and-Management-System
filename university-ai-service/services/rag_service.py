"""
Retrieval-Augmented Generation (RAG) Service.
Coordinates the Dedicated Vector Store, chunk retrieval, and PDF document ingestion.
"""

import os
import logging
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
from services.vector_store import DedicatedVectorStore
from config.database import save_knowledge_document, save_document_chunks, get_all_chunks

log = logging.getLogger(__name__)

class RAGService:
    def __init__(self, vector_store: DedicatedVectorStore):
        self.vector_store = vector_store

    def retrieve_context(self, query: str, top_k: int = 3, min_score: float = 0.08) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Retrieves the most semantically relevant document chunks for a query.
        Returns formatted context string and list of citations.
        """
        matches = self.vector_store.search(query, top_k=top_k, min_score=min_score)
        if not matches:
            return "", []

        context_parts = []
        citations = []

        for idx, match in enumerate(matches, 1):
            title = match.get("document_title", "University Document")
            page = match.get("page_number", 1)
            doc_type = match.get("document_type", "GENERAL")
            text = match.get("chunk_text", "").strip()

            context_parts.append(
                f"--- [Reference #{idx}: {title} ({doc_type}), Page {page}] ---\n{text}"
            )
            citations.append({
                "source_title": title,
                "document_type": doc_type,
                "page": page,
                "score": match.get("similarity_score", 0.0)
            })

        formatted_context = "\n\n".join(context_parts)
        return formatted_context, citations

    def ingest_pdf(self, file_path: str, title: str, document_type: str = "POLICY") -> int:
        """
        Extracts text from an uploaded PDF file, splits into semantic chunks,
        persists into MySQL knowledge_documents and document_chunks,
        and refreshes the dedicated vector store.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        reader = PdfReader(file_path)
        chunks = []

        for page_idx, page in enumerate(reader.pages, start=1):
            text = page.extract_text()
            if not text or not text.strip():
                continue

            paragraphs = text.split("\n\n")
            current_chunk = ""

            for p in paragraphs:
                p_clean = p.strip()
                if not p_clean:
                    continue

                if len(current_chunk) + len(p_clean) < 1000:
                    current_chunk += ("\n" if current_chunk else "") + p_clean
                else:
                    if current_chunk:
                        chunks.append({"page": page_idx, "text": current_chunk})
                    current_chunk = p_clean

            if current_chunk:
                chunks.append({"page": page_idx, "text": current_chunk})

        if not chunks:
            raise ValueError("No extractable text found in uploaded PDF.")

        # Save to MySQL
        doc_id = save_knowledge_document(title, document_type, file_path, "PROCESSED")
        save_document_chunks(doc_id, chunks)

        # Refresh Vector Index
        all_chunks = get_all_chunks()
        self.vector_store.build_index(all_chunks)

        log.info(f"Ingested PDF '{title}' with {len(chunks)} chunks into knowledge base.")
        return doc_id
