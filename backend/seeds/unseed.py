import sys
import os

# Append root backend directory to Python path for module resolution
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.product import Product
from app.models.inventory import InventoryLog
from app.models.sale import SaleItem

def execute_unseeding():
    db = SessionLocal()
    try:
        # Define the exact SKUs injected by the seeding protocol
        target_skus = [
            "GR-MF-001", "GR-SU-001", "GR-CO-001", "GR-SA-001",
            "PC-BS-001", "HH-LD-001", "DY-WM-001", "BV-BT-001"
        ]

        # Isolate the target entities
        products_to_delete = db.query(Product).filter(Product.sku.in_(target_skus)).all()
        
        if not products_to_delete:
            print("Target seed data absent. Termination complete.")
            return

        product_ids = [p.product_id for p in products_to_delete]

        # Phase 1: Eradicate dependent SaleItems (if any sales were tested)
        deleted_sales = db.query(SaleItem).filter(SaleItem.product_id.in_(product_ids)).delete(synchronize_session=False)
        
        # Phase 2: Eradicate dependent InventoryLogs
        deleted_logs = db.query(InventoryLog).filter(InventoryLog.product_id.in_(product_ids)).delete(synchronize_session=False)
        
        # Phase 3: Eradicate parent Product entities
        deleted_products = db.query(Product).filter(Product.sku.in_(target_skus)).delete(synchronize_session=False)

        db.commit()
        print(f"Unseeding protocol executed successfully.")
        print(f"Eradicated {deleted_products} Products, {deleted_logs} Inventory Logs, and {deleted_sales} Sale Items.")

    except Exception as e:
        db.rollback()
        print(f"Unseeding protocol failed. Transaction rolled back to maintain state integrity. Error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    execute_unseeding()