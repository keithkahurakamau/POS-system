import sys
import os
from datetime import datetime, timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.product import Product
from app.models.inventory import InventoryLog

def execute_seeding():
    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            print("Database already populated. Seeding aborted.")
            return

        print("Initiating database seeding protocol...")

        seed_data = [
            {"name": "Premium Maize Flour 2kg", "category": "Groceries", "buy": 150.0, "sell": 200.0, "qty": 50, "sku": "GR-MF-001"},
            {"name": "Refined Sugar 1kg", "category": "Groceries", "buy": 120.0, "sell": 160.0, "qty": 100, "sku": "GR-SU-001"},
            {"name": "Vegetable Cooking Oil 1L", "category": "Groceries", "buy": 250.0, "sell": 320.0, "qty": 40, "sku": "GR-CO-001"},
            {"name": "Iodized Salt 500g", "category": "Groceries", "buy": 20.0, "sell": 35.0, "qty": 200, "sku": "GR-SA-001"},
            {"name": "Antibacterial Bath Soap", "category": "Personal Care", "buy": 50.0, "sell": 80.0, "qty": 120, "sku": "PC-BS-001"},
            {"name": "Laundry Detergent 500g", "category": "Household", "buy": 100.0, "sell": 150.0, "qty": 80, "sku": "HH-LD-001"},
            {"name": "Whole Milk 500ml", "category": "Dairy", "buy": 45.0, "sell": 60.0, "qty": 60, "sku": "DY-WM-001"},
            {"name": "Black Tea Leaves 250g", "category": "Beverages", "buy": 130.0, "sell": 180.0, "qty": 45, "sku": "BV-BT-001"}
        ]

        for item in seed_data:
            new_product = Product(
                product_name=item["name"],
                category=item["category"],
                buying_price=item["buy"],
                selling_price=item["sell"],
                quantity_in_stock=item["qty"],
                sku=item["sku"],
                date_added=datetime.now(timezone.utc)
            )
            db.add(new_product)
            db.flush() 

            initial_log = InventoryLog(
                product_id=new_product.product_id,
                action_type="INITIAL_SEED",
                quantity_changed=item["qty"],
                date=datetime.now(timezone.utc)
            )
            db.add(initial_log)

        db.commit()
        print("Seeding protocol executed successfully. 8 entities inserted.")

    except Exception as e:
        db.rollback()
        print(f"Seeding failed. Transaction rolled back. Error: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    execute_seeding()