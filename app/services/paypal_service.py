from typing import Dict, Any, Optional, List
from app.core.database import get_user_by_id, deduct_paypal_balance, topup_paypal_balance, record_transaction

class PayPalWalletService:
    def get_wallet_info(self, user_id: int) -> Optional[Dict[str, Any]]:
        user = get_user_by_id(user_id)
        if not user:
            return None
        return {
            "user_id": user["id"],
            "full_name": user["full_name"],
            "paypal_email": user["paypal_email"],
            "balance": round(float(user["paypal_balance"]), 2),
            "currency": "USD",
            "status": "VERIFIED_LINKED",
            "provider": "PayPal Digital Wallet"
        }

    def process_facepal_payment(
        self,
        user_id: int,
        amount: float,
        items: List[Dict[str, Any]],
        biometric_confidence: float,
        anti_spoof_score: float
    ) -> Dict[str, Any]:
        """
        Processes real-time deduction from user's linked PayPal wallet:
        1. Checks current balance.
        2. Deducts amount if sufficient.
        3. Records transaction into database.
        """
        user = get_user_by_id(user_id)
        if not user:
            return {
                "success": False,
                "error": "User account not found.",
                "status": "FAILED"
            }

        current_balance = float(user["paypal_balance"])
        if current_balance < amount:
            # Record failed transaction
            tx_id = record_transaction(
                user_id=user_id,
                paypal_email=user["paypal_email"],
                amount=amount,
                items=items,
                status="FAILED_INSUFFICIENT_FUNDS",
                biometric_confidence=biometric_confidence,
                anti_spoof_score=anti_spoof_score
            )
            return {
                "success": False,
                "transaction_id": tx_id,
                "error": f"Insufficient PayPal balance (${current_balance:.2f} available, ${amount:.2f} required).",
                "current_balance": current_balance,
                "status": "FAILED"
            }

        # Deduct balance
        deducted = deduct_paypal_balance(user_id, amount)
        if not deducted:
            return {
                "success": False,
                "error": "Database error deducting funds.",
                "status": "FAILED"
            }

        # Record successful transaction
        tx_id = record_transaction(
            user_id=user_id,
            paypal_email=user["paypal_email"],
            amount=amount,
            items=items,
            status="COMPLETED",
            biometric_confidence=biometric_confidence,
            anti_spoof_score=anti_spoof_score
        )

        updated_user = get_user_by_id(user_id)
        new_balance = float(updated_user["paypal_balance"])

        return {
            "success": True,
            "status": "COMPLETED",
            "transaction_id": tx_id,
            "amount_deducted": amount,
            "previous_balance": current_balance,
            "new_balance": new_balance,
            "paypal_account": user["paypal_email"],
            "customer_name": user["full_name"],
            "biometric_confidence": biometric_confidence,
            "anti_spoof_score": anti_spoof_score
        }

    def top_up_wallet(self, user_id: int, amount: float) -> Dict[str, Any]:
        new_balance = topup_paypal_balance(user_id, amount)
        return {
            "success": True,
            "user_id": user_id,
            "amount_added": amount,
            "new_balance": new_balance
        }

paypal_wallet_service = PayPalWalletService()
