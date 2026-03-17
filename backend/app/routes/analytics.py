from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.sale import Sale
from app.models.product import Product
from datetime import datetime, date

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    total_products = db.query(func.count(Product.product_id)).scalar()
    inventory_value = db.query(func.sum(Product.quantity_in_stock * Product.buying_price)).scalar() or 0
    
    today = date.today()
    sales_today = db.query(func.sum(Sale.total_amount)).filter(
        func.date(Sale.sale_date) == today, 
        Sale.transaction_status == "COMPLETED"
    ).scalar() or 0

    return {
        "total_products": total_products,
        "inventory_value": inventory_value,
        "sales_today": sales_today
    }