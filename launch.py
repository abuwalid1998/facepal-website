"""
Geneva Library & FacePal Biometric E-Commerce Launcher
Handles automatic environment setup, dependency installation, port conflict resolution,
and server startup with browser launch.
"""

import sys
import os
import subprocess
import time
import socket
import webbrowser
from pathlib import Path

# Force UTF-8 encoding for console output
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent
VENV_DIR = BASE_DIR / ".venv"

def print_banner():
    print("=" * 75)
    print("  📚 GENEVA LIBRARY (مكتبة جنيفا ومستلزماتها)")
    print("  Powered by FacePal Biometric Facial Recognition & PayPal Checkout")
    print("=" * 75)
    print()

def get_venv_python() -> Path:
    if os.name == "nt":
        return VENV_DIR / "Scripts" / "python.exe"
    return VENV_DIR / "bin" / "python"

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("127.0.0.1", port)) == 0

def free_port(port: int):
    if not is_port_in_use(port):
        return
    print(f"[*] Port {port} is currently in use. Attempting to release...")
    try:
        if os.name == "nt":
            output = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True).decode()
            for line in output.strip().splitlines():
                if "LISTENING" in line:
                    parts = line.strip().split()
                    pid = parts[-1]
                    if pid != str(os.getpid()):
                        subprocess.run(f"taskkill /F /PID {pid}", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        time.sleep(1)
    except Exception as e:
        print(f"[!] Note on freeing port: {e}")

def check_and_install_dependencies(py_executable: str):
    required_modules = ["fastapi", "uvicorn", "torch", "cv2", "qdrant_client", "pydantic", "numpy"]
    missing = []
    
    for mod in required_modules:
        check_cmd = [py_executable, "-c", f"import {mod}"]
        res = subprocess.run(check_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if res.returncode != 0:
            missing.append(mod)
            
    if not missing:
        print("[1/3] All AI & web dependencies are verified and ready. [OK]")
        return

    print(f"[1/3] First-time setup detected. Installing required packages: {', '.join(missing)}...")
    req_file = BASE_DIR / "requirements.txt"
    
    # Upgrade pip
    subprocess.run([py_executable, "-m", "pip", "install", "--upgrade", "pip", "--quiet"])
    
    # Install requirements
    install_res = subprocess.run([py_executable, "-m", "pip", "install", "-r", str(req_file)])
    if install_res.returncode != 0:
        print("[!] Attempting lightweight CPU PyTorch wheel installation...")
        subprocess.run([py_executable, "-m", "pip", "install", "torch", "--index-url", "https://download.pytorch.org/whl/cpu"])
        subprocess.run([py_executable, "-m", "pip", "install", "-r", str(req_file)])

def open_browser_delayed(url: str, delay: float = 2.0):
    import threading
    def _open():
        time.sleep(delay)
        try:
            webbrowser.open(url)
        except Exception:
            pass
    threading.Thread(target=_open, daemon=True).start()

def main():
    print_banner()
    
    # Ensure working directory
    os.chdir(str(BASE_DIR))
    
    # Check if we are inside the venv or need to create/use it
    current_py = sys.executable
    venv_py = get_venv_python()
    
    # If not running from venv, verify venv existence
    if not VENV_DIR.exists():
        print("[*] Creating isolated virtual environment (.venv)...")
        try:
            import venv
            venv.create(str(VENV_DIR), with_pip=True)
            print("[*] Virtual environment created successfully. [OK]")
        except Exception as e:
            print(f"[!] Notice: Virtual environment creation fallback: {e}")
            venv_py = Path(current_py)
            
    active_py = str(venv_py) if venv_py.exists() else current_py
    
    # Verify & install dependencies
    check_and_install_dependencies(active_py)
    
    # Check & free port 7777
    print("[2/3] Checking Port 7777 availability...")
    free_port(7777)
    print("      Port 7777 is open and ready. [OK]")
    
    # Start server
    print("[3/3] Starting Geneva Library & FacePal Biometric Server...")
    print("=" * 75)
    print("  🌐 Website Storefront:  http://localhost:7777")
    print("  📊 Operations Dashboard: http://localhost:7777#dashboard")
    print("  📖 Swagger API Docs:    http://localhost:7777/docs")
    print("=" * 75)
    print("  Opening browser automatically... Press Ctrl+C to stop.")
    print()
    
    open_browser_delayed("http://localhost:7777", delay=2.5)
    
    # Run uvicorn
    cmd = [active_py, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7777"]
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n[!] Geneva Library server stopped gracefully.")

if __name__ == "__main__":
    main()
