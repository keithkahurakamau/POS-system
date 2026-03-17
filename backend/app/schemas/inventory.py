from pydantic import BaseModel
from datetime import datetime

class InventoryLogBase(BaseModel):
    product_id: int
    action_type: str
    quantity_changed: int

class InventoryLogCreate(InventoryLogBase): pass

class InventoryLogResponse(InventoryLogBase):
    log_id: int
    date: datetime
    class Config: from_attributes = True