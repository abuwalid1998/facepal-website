from fastapi import APIRouter, HTTPException, status
from app.models.schemas import FacePaymentRequest
from app.services.face_reader import face_reader_service
from app.services.paypal_service import paypal_wallet_service
from app.core.database import record_transaction, get_all_transactions, log_activity

router = APIRouter(prefix="/api/payment", tags=["FacePal Payment"])

@router.post("/verify-facepal")
def verify_and_pay_with_facepal(req: FacePaymentRequest):
    """
    Core FacePal biometric verification & PayPal wallet deduction endpoint:
    1. Liveness & Anti-spoofing check
    2. Facial identification against Vector Database
    3. PayPal balance deduction
    """
    auth_result = face_reader_service.authenticate_for_payment(req.image_data)
    auth_status = auth_result.get("status")

    if auth_status == "NO_FACE":
        return {
            "status": "NO_FACE",
            "success": False,
            "message": "No face detected in camera. Please align your face inside the FacePal scanner."
        }

    if auth_status == "SPOOF_DETECTED":
        # Log presentation attack & record blocked transaction
        log_activity(
            activity_type="SPOOF_ATTEMPT",
            details=f"Presentation attack blocked during checkout of ${req.amount:.2f}. Details: {auth_result.get('details')}",
            status="BLOCKED"
        )
        record_transaction(
            user_id=None,
            paypal_email="UNAUTHORIZED_SPOOF_ATTEMPT",
            amount=req.amount,
            items=req.items,
            status="BLOCKED_SPOOF",
            biometric_confidence=0.0,
            anti_spoof_score=auth_result.get("confidence", 0.0)
        )
        return {
            "status": "SPOOF_DETECTED",
            "success": False,
            "message": "SECURITY ALERT: Spoofing / Presentation Attack Detected! Transaction Aborted.",
            "attack_type": auth_result.get("attack_type"),
            "details": auth_result.get("details"),
            "bbox": auth_result.get("bbox")
        }

    if auth_status == "NOT_REGISTERED":
        return {
            "status": "NOT_REGISTERED",
            "success": False,
            "message": "Face is not recognized or not registered previously. Payment is not allowed.",
            "best_score": auth_result.get("best_score", 0.0),
            "bbox": auth_result.get("bbox")
        }

    if auth_status == "RECOGNIZED":
        user_id = auth_result["user_id"]
        customer_name = auth_result["full_name"]
        customer_email = auth_result["email"]
        bio_conf = auth_result.get("biometric_score", 0.95)
        anti_spoof = auth_result.get("anti_spoof_score", 0.99)

        # Process deduction from user's linked PayPal wallet
        payment_result = paypal_wallet_service.process_facepal_payment(
            user_id=user_id,
            amount=req.amount,
            items=req.items,
            biometric_confidence=bio_conf,
            anti_spoof_score=anti_spoof
        )

        return {
            "status": "RECOGNIZED",
            "success": payment_result["success"],
            "message": "Payment authorized via FacePal Biometrics!" if payment_result["success"] else payment_result.get("error"),
            "customer_name": customer_name,
            "customer_email": customer_email,
            "payment_details": payment_result,
            "bbox": auth_result.get("bbox")
        }

    return {
        "status": "ERROR",
        "success": False,
        "message": auth_result.get("message", "An unexpected error occurred during biometric scan.")
    }

@router.get("/transactions")
def list_transactions():
    return {"transactions": get_all_transactions()}
