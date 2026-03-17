from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.inventory import InventoryLog
from app.schemas.sale import SaleCreate, SaleResponse

router = APIRouter(prefix="/api/sales", tags=["Sales"])

@router.post("/", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(sale_data: SaleCreate, db: Session = Depends(get_db)):
    db_sale = Sale(total_amount=sale_data.total_amount, payment_method=sale_data.payment_method, transaction_status="PENDING")
    db.add(db_sale)
    db.flush() # Obtain sale_id without committing

    for item in sale_data.items:
        product = db.query(Product).filter(Product.product_id == item.product_id).first()
        if not product or product.quantity_in_stock < item.quantity:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Insufficient stock for product ID {item.product_id}")
        
        # Deduct stock and log
        product.quantity_in_stock -= item.quantity
        db.add(InventoryLog(product_id=product.product_id, action_type="SALE", quantity_changed=-item.quantity))
        
        db_sale_item = SaleItem(sale_id=db_sale.sale_id, product_id=item.product_id, quantity=item.quantity, 
                                unit_price=item.unit_price, subtotal=item.subtotal)
        db.add(db_sale_item)
    
    db.commit()
    db.refresh(db_sale)
    return db_sale

@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.sale_id == sale_id).first()
    if not sale: raise HTTPException(status_code=404, detail="Sale not found")
    return sale