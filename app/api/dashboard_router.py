from fastapi import APIRouter
from app.core.database import get_dashboard_stats, get_all_transactions, get_all_users, get_activity_logs
from app.core.vector_db import vector_db

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
def dashboard_stats():
    stats = get_dashboard_stats()
    stats["vector_points"] = vector_db.get_total_vectors()
    return stats

@router.get("/transactions")
def dashboard_transactions():
    return {"transactions": get_all_transactions(limit=100)}

@router.get("/customers")
def dashboard_customers():
    users = get_all_users()
    return {"customers": users, "total": len(users)}

@router.get("/logs")
def dashboard_logs():
    return {"logs": get_activity_logs(limit=50)}
