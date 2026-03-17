from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.sale import Sale, SaleItem
from app.models.product import Product
from datetime import date, timedelta

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    # --- 1. Metric Cards (Static Totals) ---
    total_products = db.query(func.count(Product.product_id)).scalar() or 0
    
    inventory_value = db.query(
        func.sum(Product.quantity_in_stock * Product.buying_price)
    ).scalar() or 0
    
    today = date.today()
    sales_today = db.query(func.sum(Sale.total_amount)).filter(
        func.date(Sale.sale_date) == today,
        Sale.transaction_status == "COMPLETED"
    ).scalar() or 0

    total_profit = db.query(
        func.sum((SaleItem.unit_price - Product.buying_price) * SaleItem.quantity)
    ).join(Product, SaleItem.product_id == Product.product_id)\
     .join(Sale, SaleItem.sale_id == Sale.sale_id)\
     .filter(Sale.transaction_status == "COMPLETED")\
     .scalar() or 0

    # --- 2. Sales Trend (Last 7 Days) ---
    # Calculates revenue per day for the chart's X-axis
    seven_days_ago = today - timedelta(days=7)
    trend_data = db.query(
        func.date(Sale.sale_date).label("day"),
        func.sum(Sale.total_amount).label("daily_revenue")
    ).filter(
        Sale.sale_date >= seven_days_ago,
        Sale.transaction_status == "COMPLETED"
    ).group_by(func.date(Sale.sale_date))\
     .order_by(func.date(Sale.sale_date))\
     .all()

    # --- 3. Inventory Distribution (By Category) ---
    # Provides the slices for the doughnut chart
    category_distribution = db.query(
        Product.category,
        func.count(Product.product_id)
    ).group_by(Product.category).all()

    return {
        "total_products": total_products,
        "inventory_value": round(inventory_value, 2),
        "sales_today": round(sales_today, 2),
        "total_profit": round(total_profit, 2),
        # Format trend for Chart.js: list of {date, total}
        "sales_trend": [{"date": str(d.day), "total": float(d.daily_revenue)} for d in trend_data],
        # Format distribution for Chart.js: { "CategoryName": Count }
        "category_dist": {cat: count for cat, count in category_distribution}
    }