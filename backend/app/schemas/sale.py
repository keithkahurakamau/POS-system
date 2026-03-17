from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SaleItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float

class SaleItemCreate(SaleItemBase): pass

class SaleItemResponse(SaleItemBase):
    sale_item_id: int
    sale_id: int
    class Config: from_attributes = True

class SaleBase(BaseModel):
    total_amount: float
    payment_method: str

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]

class SaleResponse(SaleBase):
    sale_id: int
    mpesa_receipt_number: Optional[str] = None
    transaction_status: str
    sale_date: datetime
    items: List[SaleItemResponse]
    class Config: from_attributes = True