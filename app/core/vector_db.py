import os
import json
import numpy as np
from typing import Optional, Dict, Any, List
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from app.core.config import DATA_DIR, VECTORS_DIR, SIMILARITY_THRESHOLD

COLLECTION_NAME = "juthoor_faces"
VECTOR_DIM = 128
BACKUP_INDEX_PATH = VECTORS_DIR / "face_vectors.json"
QDRANT_STORAGE_PATH = DATA_DIR / "qdrant_db"

class VectorDatabase:
    def __init__(self):
        self.client = None
        self._init_qdrant()
        self._init_backup_index()

    def _init_qdrant(self):
        try:
            self.client = QdrantClient(path=str(QDRANT_STORAGE_PATH))
            if not self.client.collection_exists(COLLECTION_NAME):
                self.client.create_collection(
                    collection_name=COLLECTION_NAME,
                    vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE)
                )
            print("[VectorDB] Qdrant persistent vector database initialized successfully.")
        except Exception as e:
            print(f"[VectorDB] Warning: Qdrant init issue: {e}. Using resilient local vector engine.")
            self.client = None

    def _init_backup_index(self):
        if not BACKUP_INDEX_PATH.exists():
            with open(BACKUP_INDEX_PATH, "w", encoding="utf-8") as f:
                json.dump({}, f)

    def _load_backup(self) -> Dict[str, Any]:
        try:
            if BACKUP_INDEX_PATH.exists():
                with open(BACKUP_INDEX_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception:
            pass
        return {}

    def _save_backup(self, data: Dict[str, Any]):
        try:
            with open(BACKUP_INDEX_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"[VectorDB] Error saving backup index: {e}")

    def add_face_embedding(self, user_id: int, full_name: str, email: str, embedding: np.ndarray, metadata: Dict[str, Any] = None):
        emb_list = [float(x) for x in embedding.flatten()]
        payload = {
            "user_id": user_id,
            "full_name": full_name,
            "email": email,
            "metadata": metadata or {}
        }

        # 1. Store in Qdrant
        if self.client:
            try:
                self.client.upsert(
                    collection_name=COLLECTION_NAME,
                    points=[PointStruct(id=user_id, vector=emb_list, payload=payload)]
                )
            except Exception as e:
                print(f"[VectorDB] Error adding point to Qdrant: {e}")

        # 2. Store in backup index
        backup_data = self._load_backup()
        backup_data[str(user_id)] = {
            "user_id": user_id,
            "full_name": full_name,
            "email": email,
            "vector": emb_list,
            "metadata": metadata or {}
        }
        self._save_backup(backup_data)
        print(f"[VectorDB] Stored 128-d face embedding for user #{user_id} ({full_name}).")

    def search_face_embedding(self, query_embedding: np.ndarray, threshold: float = SIMILARITY_THRESHOLD) -> Optional[Dict[str, Any]]:
        query_list = [float(x) for x in query_embedding.flatten()]
        best_match = None
        best_score = -1.0

        # Try Qdrant search first
        if self.client:
            try:
                # Query nearest points
                results = self.client.query_points(
                    collection_name=COLLECTION_NAME,
                    query=query_list,
                    limit=1
                ).points
                if results and len(results) > 0:
                    top = results[0]
                    score = float(top.score)
                    if score >= threshold:
                        return {
                            "user_id": top.payload["user_id"],
                            "full_name": top.payload["full_name"],
                            "email": top.payload["email"],
                            "score": round(score, 4),
                            "matched": True
                        }
                    else:
                        best_score = score
                        best_match = top.payload
            except Exception as e:
                print(f"[VectorDB] Qdrant query error: {e}. Falling back to backup index search.")

        # Resilient fallback: Cosine similarity via NumPy
        backup_data = self._load_backup()
        if not backup_data:
            return None

        q_vec = np.array(query_list, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec)
        if q_norm == 0:
            return None

        for uid_str, record in backup_data.items():
            stored_vec = np.array(record["vector"], dtype=np.float32)
            s_norm = np.linalg.norm(stored_vec)
            if s_norm > 0:
                cos_sim = float(np.dot(q_vec, stored_vec) / (q_norm * s_norm))
                if cos_sim > best_score:
                    best_score = cos_sim
                    best_match = record

        if best_match and best_score >= threshold:
            return {
                "user_id": best_match["user_id"],
                "full_name": best_match["full_name"],
                "email": best_match["email"],
                "score": round(best_score, 4),
                "matched": True
            }

        return {
            "matched": False,
            "best_score": round(max(0.0, best_score), 4),
            "threshold": threshold
        } if best_score > 0 else None

    def get_total_vectors(self) -> int:
        if self.client:
            try:
                info = self.client.get_collection(COLLECTION_NAME)
                return info.points_count or 0
            except Exception:
                pass
        backup_data = self._load_backup()
        return len(backup_data)

# Global singleton
vector_db = VectorDatabase()
