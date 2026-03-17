from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.mpesa import initiate_stk_push
from app.models.payment import Payment
from app.models.sale import Sale
from app.models.receipt import Receipt
from pydantic import BaseModel
from typing import Any, Dict
from datetime import datetime, timezone

router = APIRouter(prefix="/api/payments", tags=["Payments"])

class STKPushRequest(BaseModel):
    sale_id: int
    phone_number: str
    amount: float

@router.post("/mpesa/stkpush")
async def trigger_stk_push(req: STKPushRequest, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.sale_id == req.sale_id).first()
    if not sale: raise HTTPException(status_code=404, detail="Sale not found")
    
    response = await initiate_stk_push(req.phone_number, req.amount, f"SALE-{req.sale_id}")
    if "CheckoutRequestID" not in response:
        raise HTTPException(status_code=500, detail="M-Pesa STK Push failed")
        
    payment = Payment(sale_id=req.sale_id, phone_number=req.phone_number, amount=req.amount, 
                      transaction_id=response["CheckoutRequestID"])
    db.add(payment)
    db.commit()
    return response

@router.post("/mpesa/callback", status_code=status.HTTP_200_OK)
async def mpesa_callback(payload: Dict[Any, Any], db: Session = Depends(get_db)):
    callback_data = payload.get("Body", {}).get("stkCallback", {})
    result_code = callback_data.get("ResultCode")
    acknowledgement = {"ResultCode": 0, "ResultDesc": "Accepted"}

    if result_code != 0: return acknowledgement

    metadata = callback_data.get("CallbackMetadata", {}).get("Item", [])
    parsed_data = {item["Name"]: item.get("Value") for item in metadata}
    
    pending_payment = db.query(Payment).filter(Payment.transaction_id == callback_data.get("CheckoutRequestID")).first()
    if not pending_payment: return acknowledgement

    pending_payment.payment_status = "COMPLETED"
    pending_payment.mpesa_receipt_number = parsed_data.get("MpesaReceiptNumber")

    sale = db.query(Sale).filter(Sale.sale_id == pending_payment.sale_id).first()
    if sale:
        sale.transaction_status = "COMPLETED"
        sale.mpesa_receipt_number = parsed_data.get("MpesaReceiptNumber")
        
        # Updated timezone logic for receipt generation
        receipt_number = f"RCT-{sale.sale_id}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
        db.add(Receipt(sale_id=sale.sale_id, receipt_number=receipt_number,
                       total_amount=sale.total_amount, payment_method="MPESA"))

    db.commit()
    return acknowledgement