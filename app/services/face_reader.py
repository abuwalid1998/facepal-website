import os
import io
import time
import base64
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, Optional, Tuple, List
from app.core.config import YUNET_MODEL_PATH, SFACE_MODEL_PATH, FACES_DIR, CONFIDENCE_THRESHOLD, SIMILARITY_THRESHOLD
from app.core.vector_db import vector_db
from app.services.anti_spoofing import anti_spoofing_service

class FaceReaderService:
    def __init__(self):
        self.detector = None
        self.recognizer = None
        self._init_models()

    def _init_models(self):
        try:
            if YUNET_MODEL_PATH.exists() and SFACE_MODEL_PATH.exists():
                # YuNet detector initialized with default (320, 320) input size
                self.detector = cv2.FaceDetectorYN.create(
                    model=str(YUNET_MODEL_PATH),
                    config="",
                    input_size=(320, 320),
                    score_threshold=CONFIDENCE_THRESHOLD,
                    nms_threshold=0.3,
                    top_k=5000
                )
                self.recognizer = cv2.FaceRecognizerSF.create(
                    model=str(SFACE_MODEL_PATH),
                    config=""
                )
                print("[FaceReader] YuNet Face Detector and SFace Face Recognizer loaded successfully.")
            else:
                print(f"[FaceReader] Warning: Models not found in {YUNET_MODEL_PATH} or {SFACE_MODEL_PATH}")
        except Exception as e:
            print(f"[FaceReader] Error initializing models: {e}")

    def decode_image(self, image_data: str) -> Optional[np.ndarray]:
        """Decodes base64 data URL or raw base64 string into OpenCV BGR numpy array."""
        try:
            if "," in image_data:
                image_data = image_data.split(",")[1]
            binary = base64.b64decode(image_data)
            pil_img = Image.open(io.BytesIO(binary)).convert("RGB")
            # Convert RGB to BGR for OpenCV
            rgb_arr = np.array(pil_img)
            bgr_arr = cv2.cvtColor(rgb_arr, cv2.COLOR_RGB2BGR)
            return bgr_arr
        except Exception as e:
            print(f"[FaceReader] Error decoding base64 image: {e}")
            return None

    def detect_face(self, bgr_image: np.ndarray) -> Tuple[bool, Optional[np.ndarray], Optional[Tuple[int, int, int, int]]]:
        """
        Runs YuNet detector on the image.
        Returns: (has_face, face_array, (x, y, w, h))
        """
        if self.detector is None or bgr_image is None:
            return False, None, None

        h, w = bgr_image.shape[:2]
        self.detector.setInputSize((w, h))
        
        _, faces = self.detector.detect(bgr_image)
        if faces is None or len(faces) == 0:
            return False, None, None

        # Take face with highest detection confidence
        best_face = faces[0]
        x, y, fw, fh = int(best_face[0]), int(best_face[1]), int(best_face[2]), int(best_face[3])
        return True, best_face, (x, y, fw, fh)

    def extract_embedding(self, bgr_image: np.ndarray, face_data: np.ndarray) -> Optional[np.ndarray]:
        """Extracts 128-dimensional normalized facial embedding vector using SFace."""
        if self.recognizer is None:
            return None
        try:
            aligned_face = self.recognizer.alignCrop(bgr_image, face_data)
            feature_vector = self.recognizer.feature(aligned_face)
            # L2 normalize
            norm = np.linalg.norm(feature_vector)
            if norm > 0:
                feature_vector = feature_vector / norm
            return feature_vector
        except Exception as e:
            print(f"[FaceReader] Error extracting SFace embedding: {e}")
            return None

    def register_new_face(self, image_data: str, user_id: int, full_name: str, email: str) -> Dict[str, Any]:
        """
        Processes a face capture during registration:
        1. Decodes image
        2. Detects face
        3. Verifies liveness / anti-spoofing
        4. Extracts embedding
        5. Stores vector into Vector Database
        6. Saves avatar image file to Data/faces/
        """
        bgr = self.decode_image(image_data)
        if bgr is None:
            return {"success": False, "error": "Invalid image payload."}

        has_face, face_data, bbox = self.detect_face(bgr)
        if not has_face or face_data is None:
            return {"success": False, "error": "No face detected in camera capture. Please face the camera directly."}

        # Anti-spoofing check
        spoof_result = anti_spoofing_service.verify_liveness(bgr, bbox)
        if not spoof_result["is_real"]:
            return {
                "success": False,
                "error": "Face registration blocked: Anti-spoofing presentation attack detected.",
                "spoof_details": spoof_result
            }

        # Extract 128-d embedding
        embedding = self.extract_embedding(bgr, face_data)
        if embedding is None:
            return {"success": False, "error": "Could not compute biometric face vector."}

        # Save facial crop for user profile
        x, y, w, h = bbox
        pad_x = int(w * 0.2)
        pad_y = int(h * 0.2)
        h_img, w_img = bgr.shape[:2]
        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(w_img, x + w + pad_x)
        y2 = min(h_img, y + h + pad_y)
        crop = bgr[y1:y2, x1:x2]

        filename = f"user_{user_id}_{int(time.time())}.jpg"
        file_path = FACES_DIR / filename
        cv2.imwrite(str(file_path), crop)
        rel_face_path = f"/faces/{filename}"

        # Insert embedding into Vector Database
        vector_db.add_face_embedding(
            user_id=user_id,
            full_name=full_name,
            email=email,
            embedding=embedding,
            metadata={"face_image": rel_face_path, "registered_at": time.strftime("%Y-%m-%d %H:%M:%S")}
        )

        return {
            "success": True,
            "face_image_path": rel_face_path,
            "confidence": float(face_data[-1]),
            "anti_spoof": spoof_result
        }

    def authenticate_for_payment(self, image_data: str) -> Dict[str, Any]:
        """
        Authenticates face during 'Pay With FacePal' checkout:
        1. Detects face. If no face detected -> returns NO_FACE.
        2. Tests for presentation attack / spoofing. If spoof detected -> returns SPOOF_DETECTED.
        3. Computes SFace embedding.
        4. Searches Vector Database. If not previously registered -> returns NOT_REGISTERED.
        5. If recognized -> returns RECOGNIZED with user details and match score.
        """
        bgr = self.decode_image(image_data)
        if bgr is None:
            return {"status": "ERROR", "message": "Failed to decode camera frame."}

        has_face, face_data, bbox = self.detect_face(bgr)
        if not has_face or face_data is None:
            return {"status": "NO_FACE", "message": "No face detected in camera viewport."}

        # Step 2: Anti-spoofing check
        spoof_result = anti_spoofing_service.verify_liveness(bgr, bbox)
        if not spoof_result["is_real"]:
            return {
                "status": "SPOOF_DETECTED",
                "message": "SECURITY ALERT: Spoofing or presentation attack detected!",
                "attack_type": spoof_result.get("attack_type", "PRESENTATION_ATTACK"),
                "details": spoof_result.get("details", "Presentation attack blocked"),
                "confidence": spoof_result.get("confidence", 0.0),
                "bbox": [int(v) for v in bbox]
            }

        # Step 3: Extract feature vector
        embedding = self.extract_embedding(bgr, face_data)
        if embedding is None:
            return {"status": "ERROR", "message": "Failed to extract facial biometric features."}

        # Step 4: Vector database nearest-neighbor search
        search_result = vector_db.search_face_embedding(embedding, threshold=SIMILARITY_THRESHOLD)
        if search_result is None or not search_result.get("matched", False):
            return {
                "status": "NOT_REGISTERED",
                "message": "Face is not recognized or not registered previously. Payment not allowed.",
                "best_score": search_result.get("best_score", 0.0) if search_result else 0.0,
                "threshold": SIMILARITY_THRESHOLD,
                "bbox": [int(v) for v in bbox]
            }

        return {
            "status": "RECOGNIZED",
            "user_id": search_result["user_id"],
            "full_name": search_result["full_name"],
            "email": search_result["email"],
            "biometric_score": search_result["score"],
            "anti_spoof_score": spoof_result.get("confidence", 1.0),
            "bbox": [int(v) for v in bbox]
        }

face_reader_service = FaceReaderService()
