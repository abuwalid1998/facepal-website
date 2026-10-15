from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional

class RegisterFaceRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=120)
    paypal_email: str = Field(..., min_length=5, max_length=120)
    paypal_balance: float = Field(default=500.0, ge=0.0)
    image_data: str = Field(..., description="Base64 encoded JPEG/PNG facial image")

class FacePaymentRequest(BaseModel):
    image_data: str = Field(..., description="Live camera frame captured during checkout")
    amount: float = Field(..., gt=0.0)
    items: List[Dict[str, Any]] = Field(default_factory=list)

class TopUpRequest(BaseModel):
    user_id: int
    amount: float = Field(..., gt=0.0)
