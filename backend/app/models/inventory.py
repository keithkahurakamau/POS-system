from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class InventoryLog(Base):
    __tablename__ = "inventory_logs"
    log_id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.product_id"))
    action_type = Column(String, nullable=False) 
    quantity_changed = Column(Integer, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    
    product = relationship("Product", back_populates="inventory_logs")