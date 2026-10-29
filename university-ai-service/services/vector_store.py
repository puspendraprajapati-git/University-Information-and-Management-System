"""
Dedicated Vector Store for Retrieval-Augmented Generation (RAG).
Stores embedding matrices and chunk metadata separately from the MySQL document_chunks table.
Supports cosine similarity search with persistent disk caching.
"""

import os
import json
import logging
import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from config.settings import VECTOR_STORE_DIR

log = logging.getLogger(__name__)

class DedicatedVectorStore:
    """
    Dedicated in-memory and disk-persisted vector store.
    Encapsulates document chunk vectors, L2 cosine normalization, and metadata indexes.
    """

    def __init__(self, storage_dir: Optional[str] = None):
        self.storage_dir = storage_dir or VECTOR_STORE_DIR
        os.makedirs(self.storage_dir, exist_ok=True)
        
        self.metadata_file = os.path.join(self.storage_dir, "vector_metadata.json")
        self.matrix_file = os.path.join(self.storage_dir, "vector_matrix.npy")
        self.vocab_file = os.path.join(self.storage_dir, "vector_vocab.json")

        self.vectorizer: Optional[TfidfVectorizer] = None
        self.embedding_matrix: Optional[np.ndarray] = None
        self.metadata: List[Dict[str, Any]] = []

        # Load persisted index if available on disk
        self._load_from_disk()

    def _load_from_disk(self) -> bool:
        """Loads cached vector index and metadata from disk."""
        try:
            if os.path.exists(self.metadata_file) and os.path.exists(self.matrix_file) and os.path.exists(self.vocab_file):
                with open(self.metadata_file, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)

                with open(self.vocab_file, "r", encoding="utf-8") as f:
                    vocab_data = json.load(f)

                self.embedding_matrix = np.load(self.matrix_file)

                # Reconstruct vectorizer with cached vocabulary and idf
                self.vectorizer = TfidfVectorizer(
                    ngram_range=(1, 2),
                    sublinear_tf=True,
                    lowercase=True,
                    stop_words="english",
                    vocabulary=vocab_data.get("vocabulary")
                )
                if "idf" in vocab_data:
                    self.vectorizer.idf_ = np.array(vocab_data["idf"])

                log.info(f"Loaded dedicated vector store with {len(self.metadata)} chunks from {self.storage_dir}")
                return True
        except Exception as e:
            log.warning(f"Could not load vector store from disk: {e}. Index will be rebuilt.")
        return False

    def _save_to_disk(self):
        """Persists current embeddings, vocabulary, and metadata to disk."""
        try:
            with open(self.metadata_file, "w", encoding="utf-8") as f:
                json.dump(self.metadata, f, ensure_ascii=False, indent=2)

            if self.embedding_matrix is not None:
                np.save(self.matrix_file, self.embedding_matrix)

            if self.vectorizer is not None and hasattr(self.vectorizer, "vocabulary_"):
                vocab_data = {
                    "vocabulary": {str(k): int(v) for k, v in self.vectorizer.vocabulary_.items()},
                    "idf": self.vectorizer.idf_.tolist() if hasattr(self.vectorizer, "idf_") else []
                }
                with open(self.vocab_file, "w", encoding="utf-8") as f:
                    json.dump(vocab_data, f, ensure_ascii=False)

            log.info(f"Saved {len(self.metadata)} vector records to {self.storage_dir}")
        except Exception as e:
            log.error(f"Failed to persist vector store: {e}")

    def build_index(self, chunks: List[Dict[str, Any]]):
        """
        Builds the vector store index from an array of document chunks.
        Normalizes vectors for cosine similarity computation.
        """
        if not chunks:
            log.warning("No chunks provided to build vector index.")
            return

        corpus = [c["chunk_text"] for c in chunks]
        self.metadata = []

        for c in chunks:
            self.metadata.append({
                "chunk_id": c.get("chunk_id"),
                "document_id": c.get("document_id"),
                "document_title": c.get("document_title", "University Document"),
                "document_type": c.get("document_type", "GENERAL"),
                "page_number": c.get("page_number", 1),
                "chunk_text": c.get("chunk_text", "")
            })

        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            lowercase=True,
            stop_words="english",
            max_features=8000
        )

        sparse_matrix = self.vectorizer.fit_transform(corpus)
        dense_matrix = sparse_matrix.toarray()

        # L2-normalize vectors for fast dot-product cosine similarity
        norms = np.linalg.norm(dense_matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        self.embedding_matrix = dense_matrix / norms

        self._save_to_disk()
        log.info(f"Successfully indexed {len(self.metadata)} chunks into dedicated vector store.")

    def search(self, query: str, top_k: int = 3, min_score: float = 0.08) -> List[Dict[str, Any]]:
        """
        Performs semantic vector search against the indexed document chunks.
        Returns top-K results sorted by cosine similarity score.
        """
        if not query or not query.strip() or self.embedding_matrix is None or not self.metadata or self.vectorizer is None:
            return []

        try:
            # Transform query to vector
            query_vec = self.vectorizer.transform([query.strip()]).toarray()
            query_norm = np.linalg.norm(query_vec)
            if query_norm > 0:
                query_vec = query_vec / query_norm

            # Cosine similarity dot product
            scores = np.dot(self.embedding_matrix, query_vec.T).flatten()

            # Rank by score descending
            ranked_indices = np.argsort(scores)[::-1]

            results = []
            for idx in ranked_indices:
                score = float(scores[idx])
                if score < min_score:
                    break
                item = dict(self.metadata[idx])
                item["similarity_score"] = round(score, 4)
                results.append(item)
                if len(results) >= top_k:
                    break

            return results
        except Exception as e:
            log.error(f"Error during vector search: {e}")
            return []

    def is_empty(self) -> bool:
        """Returns True if the store contains no indexed chunks."""
        return self.embedding_matrix is None or len(self.metadata) == 0
