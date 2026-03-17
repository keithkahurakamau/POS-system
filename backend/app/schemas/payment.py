from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentBase(BaseModel):
    sale_id: int
    phone_number: str
    amount: float

class PaymentCreate(PaymentBase):
    transaction_id: str

class PaymentResponse(PaymentBase):
    payment_id: int
    mpesa_receipt_number: Optional[str] = None
    transaction_id: str
    payment_status: str
    payment_date: datetime
    class Config: from_attributes = True