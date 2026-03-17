from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Product(Base):
    __tablename__ = "products"
    product_id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, nullable=False)
    category = Column(String, index=True)
    description = Column(String)
    buying_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    quantity_in_stock = Column(Integer, default=0)
    supplier_name = Column(String)
    sku = Column(String, unique=True, index=True)
    image_url = Column(String)
    date_added = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    inventory_logs = relationship("InventoryLog", back_populates="product")
    sale_items = relationship("SaleItem", back_populates="product")