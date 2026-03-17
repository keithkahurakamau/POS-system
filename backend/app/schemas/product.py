from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    product_name: str
    category: str
    description: Optional[str] = None
    buying_price: float
    selling_price: float
    quantity_in_stock: int
    supplier_name: Optional[str] = None
    sku: str

class ProductCreate(ProductBase): pass

class ProductResponse(ProductBase):
    product_id: int
    image_url: Optional[str] = None
    date_added: datetime
    class Config: from_attributes = True