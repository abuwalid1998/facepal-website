# 📚 GENEVA LIBRARY (مكتبة جنيفا ومستلزماتها) | Powered by FacePal Biometric Checkout

[![Deploy to GitHub Pages](https://github.com/abuwalid1998/facepal-website/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/abuwalid1998/facepal-website/actions/workflows/deploy-pages.yml)
[![Live Demo](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-brightgreen?style=flat&logo=github)](https://abuwalid1998.github.io/facepal-website/)

> 🌐 **Live Demo Website:** [https://abuwalid1998.github.io/facepal-website/](https://abuwalid1998.github.io/facepal-website/)  
> Experience the full bilingual store, camera biometric checkout HUD, anti-spoofing alert testing, and operational dashboard live in your browser!

**GENEVA LIBRARY (مكتبة جنيفا ومستلزماتها)** is a luxury stationery, academic books, fine writing instruments, and school accessories e-commerce platform, powered by **FacePal** — an advanced biometric payment method that uses Facial Recognition and Anti-Spoofing AI models to authorize instant deductions from your linked **PayPal Wallet**.

---

## 🎨 Design & Store Identity

- **Brand Name**: **GENEVA LIBRARY (مكتبة جنيفا ومستلزماتها)**
- **Official Logo**: Custom Geneva Library crest logo with golden tree, open book of wisdom, and academic badges.
- **Bilingual Interface**: Seamless instant toggle between **English** and **العربية (Arabic)** with native RTL & LTR styling.
- **Color Palette**:
  - **Navbar**: `#a84444` (Regal Crimson Burgundy)
  - **Footer**: `#080808` (Deep Obsidian Black)
  - **Website Accent**: `#df6d6f` (Vibrant Rose Gold Accent)
- **Official FacePal Logo**: Integrated into the header, checkout drawer, and biometric payment modal.
- **10 Curated Library & Accessories Products** (no dummy data, only real high-resolution images & descriptions):
  1. **Geneva Master Gold Fountain Pen & Ink Set** (24k Gold Plated Nib)
  2. **Vintage Embossed Leather Journal & Daily Planner** (Full-Grain Leather)
  3. **Studio Acrylic & Sketching Artist Art Box (72 Pcs)** (Professional Grade)
  4. **Oxford English-Arabic Illustrated Comprehensive Dictionary** (Essential Reference)
  5. **World Masterpieces Hardcover Classics Collection (3 Vols)** (Collector's Edition)
  6. **Geneva Ergonomic Multi-Pocket School & Laptop Backpack** (Orthopedic Support)
  7. **Solid Walnut Executive Desktop Stationery Organizer** (Natural Walnut Wood)
  8. **STEM Smart Interactive Robotics & Coding Kit for Youth** (Scratch & Python)
  9. **Precision Pastel & Metallic Fineliner Pens (Set of 36)** (0.4mm Metal Clad Tip)
  10. **Geneva Royal Wax Seal, Brass Stamp & Quill Gift Box** (Premium Gift Edition)

---

## 👁️ FaceReader Biometric Engine & Models

All models run **locally** on CPU without cloud dependencies:
1. **Face Detection**: OpenCV **YuNet** (`face_detection_yunet_2023mar.onnx`) detects faces and 5 facial landmarks in real time.
2. **Face Recognition & Embeddings**: OpenCV **SFace** (`face_recognition_sface_2021dec.onnx`) extracts 128-dimensional normalized facial feature vectors.
3. **Anti-Spoofing & Liveness**: PyTorch **MiniFASNetV2** (`2.7_80x80_MiniFASNetV2.pth`) combined with multi-spectral texture, glare, and Fourier frequency analysis to detect and block screen replays, paper printouts, and digital attacks.
4. **Vector Database**: Embedded **Qdrant Vector Database** indexing 128-d vectors with Cosine distance search in `Data/qdrant_db` and synced persistent storage in `Data/vectors/`.

---

## 💳 Payment & Security Rules

1. **Pay With FacePal**: Customer clicks the FacePal button in the slide-over cart.
2. **10-Second Window**: The payment popup displays a live camera HUD with a 10-second circular countdown timer. If no face is detected within 10 seconds, the modal automatically closes and refreshes the page.
3. **Anti-Spoofing Alert ("X" Mark)**: If a presentation attack or photo/screen spoof is detected, the modal shows a prominent red pulsing **"X"** with the alert:
   > `SECURITY ALERT: SPOOFING DETECTED! Presentation attack blocked. Payment aborted.`
   and automatically aborts the transaction and closes the popup.
4. **Registration Gate**: Only previously registered faces can authorize payments. Unregistered faces trigger an instant alert with a link to register.
5. **PayPal Wallet Deduction**: When a recognized face passes verification, the exact cart total is deducted from their linked PayPal wallet in `Data/juthoor.db`, recording the transaction ID, items, and biometric confidence.

---

## 📊 Operations Dashboard

Access the real-time Dashboard via the navigation bar:
- **Total Sales ($)** processed via FacePal
- **Completed Orders** count
- **Blocked Spoofs** security count
- **Registered Faces** database
- **Transactions Ledger Table** (Customer name, face avatar, PayPal email, amount, items, biometric match %, timestamp)
- **Customer Face Management** (Wallet balances, top-up buttons)
- **Security Audit Logs**

---

## 📁 Clean Architecture Project Structure

```
FacePal Website/
├── app/
│   ├── api/
│   │   ├── products_router.py      # /api/products
│   │   ├── faces_router.py         # /api/faces/register
│   │   ├── payment_router.py       # /api/payment/verify-facepal
│   │   ├── dashboard_router.py     # /api/dashboard/stats & /transactions
│   │   └── paypal_router.py        # /api/paypal/wallet & /topup
│   ├── core/
│   │   ├── config.py               # Paths, model filenames & thresholds
│   │   ├── database.py             # SQLite database in Data/juthoor.db
│   │   └── vector_db.py            # Qdrant Vector Database engine
│   ├── models/
│   │   └── schemas.py              # Pydantic models
│   ├── services/
│   │   ├── anti_spoofing.py        # MiniFASNetV2 deep learning service
│   │   ├── face_reader.py          # YuNet + SFace biometric verification
│   │   ├── paypal_service.py       # Mock PayPal wallet deduction engine
│   │   └── store_service.py        # 10 authentic Palestinian products
│   └── main.py                     # FastAPI entrypoint & model lifespan loader
├── Data/                           # Persistent Database Folder
│   ├── juthoor.db                  # SQLite database
│   ├── faces/                      # Stored face images
│   └── vectors/                    # Vector index storage
├── models/                         # Local Neural Models
│   ├── face_detection_yunet_2023mar.onnx
│   ├── face_recognition_sface_2021dec.onnx
│   └── 2.7_80x80_MiniFASNetV2.pth
├── static/
│   ├── css/style.css               # Rich UI with #a84444, #080808, #df6d6f
│   ├── js/
│   │   ├── app.js                  # Bilingual i18n, products, cart drawer
│   │   ├── face_reader.js          # WebCam HUD, 10s timer, spoofing alert
│   │   └── dashboard.js            # Real-time analytics & transaction ledger
│   └── images/
│       ├── facepal_logo.png        # Official FacePal logo
│       ├── hero_banner.jpg         # Palestinian heritage hero banner
│       └── products/ (10 images)   # Authentic product photography
├── Dockerfile                      # Single container on port 7777
├── docker-compose.yml              # Container orchestrator
├── requirements.txt                # Python dependencies
├── run_docker.bat                  # Runs the Docker container on port 7777
└── run_local.bat                   # Runs the project locally on port 7777
```

---

## 🚀 How to Run

### Option 1: Run via Docker (Port 7777)
Simply double-click:
```bat
run_docker.bat
```
or run from terminal:
```bash
docker build -t juthoor-facepal:latest .
docker run -d -p 7777:7777 -v "%cd%\Data:/app/Data" --name juthoor_facepal_app juthoor-facepal:latest
```
Then visit: **`http://localhost:7777`**

### Option 2: Run Locally with Python (Port 7777)
Simply double-click:
```bat
run_local.bat
```
or run from terminal:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 7777 --reload
```
Then visit: **`http://localhost:7777`**
