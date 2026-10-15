import sqlite3
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.core.config import DB_PATH

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Users & PayPal Wallets table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            paypal_email TEXT NOT NULL,
            paypal_balance REAL DEFAULT 500.0,
            face_image_path TEXT,
            created_at TEXT NOT NULL,
            is_active INTEGER DEFAULT 1
        )
    """)
    
    # Transactions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            paypal_email TEXT NOT NULL,
            amount REAL NOT NULL,
            items_json TEXT NOT NULL,
            status TEXT NOT NULL,
            biometric_confidence REAL,
            anti_spoof_score REAL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # Activity and Security Audit logs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            activity_type TEXT NOT NULL,
            details TEXT,
            status TEXT NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)
    
    conn.commit()
    conn.close()

def create_user(full_name: str, email: str, paypal_email: str, paypal_balance: float, face_image_path: str) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO users (full_name, email, paypal_email, paypal_balance, face_image_path, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (full_name, email, paypal_email, paypal_balance, face_image_path, now))
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    log_activity("REGISTER", f"User registered: {full_name} ({email}) with PayPal: {paypal_email}", "SUCCESS")
    return user_id

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ? OR paypal_email = ?", (email, email))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_all_users() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def deduct_paypal_balance(user_id: int, amount: float) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT paypal_balance FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return False
    current_balance = row["paypal_balance"]
    if current_balance < amount:
        conn.close()
        return False
    
    new_balance = round(current_balance - amount, 2)
    cursor.execute("UPDATE users SET paypal_balance = ? WHERE id = ?", (new_balance, user_id))
    conn.commit()
    conn.close()
    return True

def topup_paypal_balance(user_id: int, amount: float) -> float:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT paypal_balance FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return 0.0
    new_balance = round(row["paypal_balance"] + amount, 2)
    cursor.execute("UPDATE users SET paypal_balance = ? WHERE id = ?", (new_balance, user_id))
    conn.commit()
    conn.close()
    log_activity("WALLET_TOPUP", f"Topped up ${amount:.2f} for user #{user_id}. New balance: ${new_balance:.2f}", "SUCCESS")
    return new_balance

def record_transaction(
    user_id: Optional[int],
    paypal_email: str,
    amount: float,
    items: List[Dict[str, Any]],
    status: str,
    biometric_confidence: float = 0.0,
    anti_spoof_score: float = 0.0
) -> str:
    tx_id = f"FP-TXN-{uuid.uuid4().hex[:10].upper()}"
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO transactions (id, user_id, paypal_email, amount, items_json, status, biometric_confidence, anti_spoof_score, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (tx_id, user_id, paypal_email, amount, json.dumps(items), status, biometric_confidence, anti_spoof_score, now))
    conn.commit()
    conn.close()
    
    log_activity("PAYMENT", f"Transaction {tx_id} - ${amount:.2f} via {paypal_email} [{status}]", status)
    return tx_id

def get_all_transactions(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT t.*, u.full_name, u.face_image_path
        FROM transactions t
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        d = dict(r)
        try:
            d["items"] = json.loads(d["items_json"])
        except Exception:
            d["items"] = []
        result.append(d)
    return result

def get_dashboard_stats() -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    
    # Total completed sales
    cursor.execute("SELECT COALESCE(SUM(amount), 0) as total_sales FROM transactions WHERE status = 'COMPLETED'")
    total_sales = cursor.fetchone()["total_sales"]
    
    # Total completed transactions count
    cursor.execute("SELECT COUNT(*) as completed_count FROM transactions WHERE status = 'COMPLETED'")
    completed_count = cursor.fetchone()["completed_count"]
    
    # Total spoof attempts blocked
    cursor.execute("SELECT COUNT(*) as spoof_count FROM transactions WHERE status = 'BLOCKED_SPOOF'")
    spoof_count = cursor.fetchone()["spoof_count"]
    
    # Total registered users with face recognition
    cursor.execute("SELECT COUNT(*) as user_count FROM users")
    user_count = cursor.fetchone()["user_count"]
    
    conn.close()
    return {
        "total_sales": round(float(total_sales), 2),
        "completed_count": int(completed_count),
        "spoof_count": int(spoof_count),
        "registered_users": int(user_count)
    }

def log_activity(activity_type: str, details: str, status: str = "INFO"):
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO activity_logs (activity_type, details, status, timestamp)
        VALUES (?, ?, ?, ?)
    """, (activity_type, details, status, now))
    conn.commit()
    conn.close()

def get_activity_logs(limit: int = 30) -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
