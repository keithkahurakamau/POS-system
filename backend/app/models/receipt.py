from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Receipt(Base):
    __tablename__ = "receipts"
    receipt_id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.sale_id"))
    receipt_number = Column(String, unique=True, index=True)
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)
    receipt_date = Column(DateTime, default=datetime.utcnow)
    
    sale = relationship("Sale", back_populates="receipt")