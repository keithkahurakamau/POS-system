from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import shutil, os, uuid
from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse
from app.config import settings

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_name: str = Form(...), category: str = Form(...),
    buying_price: float = Form(...), selling_price: float = Form(...),
    quantity_in_stock: int = Form(...), sku: str = Form(...),
    image: UploadFile = File(None), db: Session = Depends(get_db)
):
    image_url = None
    if image:
        file_name = f"{uuid.uuid4()}.{image.filename.split('.')[-1]}"
        file_path = os.path.join(settings.UPLOAD_DIR, file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/uploads/{file_name}"

    db_product = Product(product_name=product_name, category=category, buying_price=buying_price, 
                         selling_price=selling_price, quantity_in_stock=quantity_in_stock, 
                         sku=sku, image_url=image_url)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product: raise HTTPException(status_code=404, detail="Product not found")
    return product