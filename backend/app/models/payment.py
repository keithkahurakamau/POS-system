from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Payment(Base):
    __tablename__ = "payments"
    payment_id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.sale_id"))
    phone_number = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    mpesa_receipt_number = Column(String, nullable=True)
    transaction_id = Column(String, unique=True, index=True)
    payment_status = Column(String, default="PENDING")
    payment_date = Column(DateTime, default=datetime.utcnow)
    
    sale = relationship("Sale", back_populates="payment")