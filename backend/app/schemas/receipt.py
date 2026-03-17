from pydantic import BaseModel
from datetime import datetime

class ReceiptBase(BaseModel):
    sale_id: int
    receipt_number: str
    total_amount: float
    payment_method: str

class ReceiptCreate(ReceiptBase): pass

class ReceiptResponse(ReceiptBase):
    receipt_id: int
    receipt_date: datetime
    class Config: from_attributes = True