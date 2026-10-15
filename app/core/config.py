import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Data directory
DATA_DIR = BASE_DIR / "Data"
DATA_DIR.mkdir(exist_ok=True)

FACES_DIR = DATA_DIR / "faces"
FACES_DIR.mkdir(exist_ok=True)

VECTORS_DIR = DATA_DIR / "vectors"
VECTORS_DIR.mkdir(exist_ok=True)

DB_PATH = DATA_DIR / "juthoor.db"

# Models directory
MODELS_DIR = BASE_DIR / "models"
YUNET_MODEL_PATH = MODELS_DIR / "face_detection_yunet_2023mar.onnx"
SFACE_MODEL_PATH = MODELS_DIR / "face_recognition_sface_2021dec.onnx"
MINIFAS_MODEL_PATH = MODELS_DIR / "2.7_80x80_MiniFASNetV2.pth"

# Recognition and Anti-spoofing parameters
SIMILARITY_THRESHOLD = 0.55  # Cosine similarity threshold for SFace
CONFIDENCE_THRESHOLD = 0.45  # Face detection confidence threshold for YuNet
ANTI_SPOOF_REAL_THRESHOLD = 0.50  # Probability threshold for real face vs presentation attack

PORT = 7777
HOST = "0.0.0.0"
