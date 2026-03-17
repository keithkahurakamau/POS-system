from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.product import Product
from app.models.inventory import InventoryLog
from app.schemas.inventory import InventoryLogCreate, InventoryLogResponse

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])

@router.post("/restock", response_model=InventoryLogResponse)
def restock_product(log_data: InventoryLogCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_id == log_data.product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    
    product.quantity_in_stock += log_data.quantity_changed
    log = InventoryLog(product_id=product.product_id, action_type="RESTOCK", quantity_changed=log_data.quantity_changed)
    
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.get("/logs", response_model=List[InventoryLogResponse])
def get_inventory_logs(db: Session = Depends(get_db)):
    return db.query(InventoryLog).order_by(InventoryLog.date.desc()).all()