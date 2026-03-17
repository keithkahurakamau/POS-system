from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from app.models.inventory import InventoryLog
from app.schemas.sale import SaleCreate, SaleResponse
from app.services.pdf_engine import generate_receipt_pdf

router = APIRouter(prefix="/api/sales", tags=["Sales"])

# --- CREATE SALE ---
@router.post("/", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale(sale_data: SaleCreate, db: Session = Depends(get_db)):
    # LOGIC UPDATE: Cash is instant, M-Pesa starts as PENDING
    status_label = "COMPLETED" if sale_data.payment_method == "CASH" else "PENDING"
    
    db_sale = Sale(
        total_amount=sale_data.total_amount, 
        payment_method=sale_data.payment_method, 
        transaction_status=status_label
    )
    db.add(db_sale)
    db.flush()

    for item in sale_data.items:
        product = db.query(Product).filter(Product.product_id == item.product_id).first()
        
        if not product or product.quantity_in_stock < item.quantity:
            db.rollback()
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for {product.product_name if product else 'ID ' + str(item.product_id)}"
            )
        
        # Deduct stock immediately for both payment types
        product.quantity_in_stock -= item.quantity
        db.add(InventoryLog(
            product_id=product.product_id, 
            action_type="SALE", 
            quantity_changed=-item.quantity
        ))
        
        db_sale_item = SaleItem(
            sale_id=db_sale.sale_id, 
            product_id=item.product_id, 
            quantity=item.quantity, 
            unit_price=item.unit_price, 
            subtotal=item.subtotal
        )
        db.add(db_sale_item)
    
    db.commit()
    db.refresh(db_sale)
    return db_sale

# --- GET SINGLE SALE ---
@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.sale_id == sale_id).first()
    if not sale: 
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale

# --- GENERATE & DOWNLOAD RECEIPT ---
@router.get("/{sale_id}/receipt")
def get_receipt(sale_id: int, db: Session = Depends(get_db)):
    sale = db.query(Sale).filter(Sale.sale_id == sale_id).first()
    
    if not sale:
        raise HTTPException(status_code=404, detail="Sale record not found")
    
    # VALIDATION UPDATE: Allow receipt if CASH (Completed) or MPESA (Completed)
    if sale.transaction_status != "COMPLETED":
         raise HTTPException(
             status_code=400, 
             detail="Cannot generate receipt for incomplete transactions."
         )

    pdf_buffer = generate_receipt_pdf(sale, sale.items)
    
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=Receipt_ShopMaster_{sale_id}.pdf"
        }
    )

# --- GET ALL SALES ---
@router.get("/", response_model=List[SaleResponse])
def get_all_sales(db: Session = Depends(get_db)):
    return db.query(Sale).order_by(Sale.sale_date.desc()).all()