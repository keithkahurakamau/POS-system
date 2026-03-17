from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.mpesa import initiate_stk_push
from app.models.payment import Payment
from app.models.sale import Sale
from pydantic import BaseModel

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