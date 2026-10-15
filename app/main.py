import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import DATA_DIR, FACES_DIR, BASE_DIR
from app.core.database import init_db
from app.services.face_reader import face_reader_service
from app.services.anti_spoofing import anti_spoofing_service
from app.core.vector_db import vector_db
from app.api.products_router import router as products_router
from app.api.faces_router import router as faces_router
from app.api.payment_router import router as payment_router
from app.api.dashboard_router import router as dashboard_router
from app.api.paypal_router import router as paypal_router

import sys
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 65)
    print("  [GENEVA LIBRARY - Maktabat Geneva] Powered by FacePal")
    print("=" * 65)
    print("1. Initializing SQLite database at Data/juthoor.db...")
    init_db()
    
    print("2. Preloading Face Detection & Recognition models (YuNet + SFace)...")
    _ = face_reader_service.detector
    _ = face_reader_service.recognizer
    
    print("3. Preloading Anti-Spoofing Neural Network (MiniFASNetV2)...")
    _ = anti_spoofing_service.model
    
    print("4. Connecting Vector Database...")
    total_vectors = vector_db.get_total_vectors()
    print(f"   Indexed face vectors in database: {total_vectors}")
    print("=" * 65)
    print("  [ONLINE] GENEVA LIBRARY Service is ready on http://localhost:7777")
    print("=" * 65)
    yield
    print("Shutting down FacePal server...")

app = FastAPI(
    title="GENEVA LIBRARY - Powered by FacePal",
    description="Geneva Library & Accessories E-Commerce with Biometric FacePal & PayPal Wallet Integration",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(products_router)
app.include_router(faces_router)
app.include_router(payment_router)
app.include_router(dashboard_router)
app.include_router(paypal_router)

# Mount static and face files
STATIC_DIR = BASE_DIR / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.mount("/css", StaticFiles(directory=str(STATIC_DIR / "css")), name="css")
app.mount("/js", StaticFiles(directory=str(STATIC_DIR / "js")), name="js")
app.mount("/images", StaticFiles(directory=str(STATIC_DIR / "images")), name="images")
app.mount("/faces", StaticFiles(directory=str(FACES_DIR)), name="faces")

@app.get("/")
def serve_index():
    return FileResponse(str(STATIC_DIR / "index.html"))

@app.get("/register")
def serve_register_page():
    return FileResponse(str(STATIC_DIR / "index.html"))

@app.get("/dashboard")
def serve_dashboard_page():
    return FileResponse(str(STATIC_DIR / "index.html"))

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Juthoor FacePal E-Commerce",
        "models_loaded": {
            "yunet_detector": face_reader_service.detector is not None,
            "sface_recognizer": face_reader_service.recognizer is not None,
            "anti_spoofing_minifas": anti_spoofing_service.model is not None,
        },
        "vector_count": vector_db.get_total_vectors()
    }
