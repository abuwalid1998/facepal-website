from fastapi import APIRouter, HTTPException
from app.models.schemas import TopUpRequest
from app.services.paypal_service import paypal_wallet_service

router = APIRouter(prefix="/api/paypal", tags=["PayPal Wallet"])

@router.get("/wallet/{user_id}")
def get_user_wallet(user_id: int):
    wallet = paypal_wallet_service.get_wallet_info(user_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="User wallet not found")
    return wallet

@router.post("/topup")
def top_up_user_wallet(req: TopUpRequest):
    result = paypal_wallet_service.top_up_wallet(req.user_id, req.amount)
    return result
