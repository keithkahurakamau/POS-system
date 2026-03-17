from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Sale(Base):
    __tablename__ = "sales"
    sale_id = Column(Integer, primary_key=True, index=True)
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String)
    mpesa_receipt_number = Column(String, nullable=True)
    transaction_status = Column(String, default="PENDING")
    sale_date = Column(DateTime, default=datetime.utcnow)
    
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="sale", uselist=False)
    receipt = relationship("Receipt", back_populates="sale", uselist=False)

class SaleItem(Base):
    __tablename__ = "sale_items"
    sale_item_id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.sale_id"))
    product_id = Column(Integer, ForeignKey("products.product_id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)
    
    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")