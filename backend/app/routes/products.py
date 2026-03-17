from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil, os, uuid
from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse
from app.config import settings

router = APIRouter(prefix="/api/products", tags=["Products"])

# --- CREATE ---
@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_name: str = Form(...), 
    category: str = Form(...),
    buying_price: float = Form(...), 
    selling_price: float = Form(...),
    quantity_in_stock: int = Form(...), 
    sku: str = Form(...),
    description: Optional[str] = Form(None),
    image: UploadFile = File(None), 
    db: Session = Depends(get_db)
):
    image_url = None
    if image:
        file_name = f"{uuid.uuid4()}.{image.filename.split('.')[-1]}"
        file_path = os.path.join(settings.UPLOAD_DIR, file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/uploads/{file_name}"

    db_product = Product(
        product_name=product_name, 
        category=category, 
        buying_price=buying_price, 
        selling_price=selling_price, 
        quantity_in_stock=quantity_in_stock, 
        sku=sku, 
        description=description,
        image_url=image_url
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# --- READ ALL ---
@router.get("/", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

# --- READ ONE ---
@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product: 
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# --- UPDATE ---
@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_name: str = Form(...),
    category: str = Form(...),
    buying_price: float = Form(...),
    selling_price: float = Form(...),
    quantity_in_stock: int = Form(...),
    sku: str = Form(...),
    description: Optional[str] = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter(Product.product_id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Handle new image upload and remove old one if it exists
    if image:
        # Delete old file
        if db_product.image_url:
            old_path = os.path.join("app", db_product.image_url.lstrip("/"))
            if os.path.exists(old_path):
                os.remove(old_path)
        
        # Save new file
        file_name = f"{uuid.uuid4()}.{image.filename.split('.')[-1]}"
        file_path = os.path.join(settings.UPLOAD_DIR, file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        db_product.image_url = f"/uploads/{file_name}"

    # Update fields
    db_product.product_name = product_name
    db_product.category = category
    db_product.buying_price = buying_price
    db_product.selling_price = selling_price
    db_product.quantity_in_stock = quantity_in_stock
    db_product.sku = sku
    db_product.description = description

    db.commit()
    db.refresh(db_product)
    return db_product

# --- DELETE ---
@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.product_id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Delete associated image file from disk
    if db_product.image_url:
        file_path = os.path.join("app", db_product.image_url.lstrip("/"))
        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(db_product)
    db.commit()
    return None