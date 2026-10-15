from fastapi import APIRouter, HTTPException, status
from app.models.schemas import RegisterFaceRequest
from app.core.database import create_user, get_user_by_email, get_all_users
from app.services.face_reader import face_reader_service

router = APIRouter(prefix="/api/faces", tags=["Face Registration"])

@router.post("/register")
def register_face(req: RegisterFaceRequest):
    existing = get_user_by_email(req.email)
    if existing:
        user_id = existing["id"]
        from app.core.database import get_connection
        conn = get_connection()
        conn.execute(
            "UPDATE users SET full_name = ?, paypal_email = ?, paypal_balance = ? WHERE id = ?",
            (req.full_name, req.paypal_email, req.paypal_balance, user_id)
        )
        conn.commit()
        conn.close()
    else:
        user_id = create_user(
            full_name=req.full_name,
            email=req.email,
            paypal_email=req.paypal_email,
            paypal_balance=req.paypal_balance,
            face_image_path=""
        )

    # 2. Register face biometric embedding
    face_result = face_reader_service.register_new_face(
        image_data=req.image_data,
        user_id=user_id,
        full_name=req.full_name,
        email=req.email
    )

    if not face_result.get("success", False):
        if not existing:
            from app.core.database import get_connection
            conn = get_connection()
            conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()
            conn.close()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=face_result.get("error", "Biometric face registration failed.")
        )

    # Update face image path in user record
    face_path = face_result.get("face_image_path", "")
    from app.core.database import get_connection
    conn = get_connection()
    conn.execute("UPDATE users SET face_image_path = ? WHERE id = ?", (face_path, user_id))
    conn.commit()
    conn.close()

    return {
        "success": True,
        "message": f"Welcome, {req.full_name}! Face biometrics and PayPal Wallet registered successfully.",
        "user_id": user_id,
        "paypal_email": req.paypal_email,
        "paypal_balance": req.paypal_balance,
        "face_image": face_path
    }

@router.get("/users")
def list_registered_users():
    users = get_all_users()
    return {"users": users, "total": len(users)}
