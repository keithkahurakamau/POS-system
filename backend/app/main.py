import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.config import settings

# Import the route modules
from app.routes import auth, products, sales, payments, analytics

# Ensure the upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Generate database tables based on our ORM models
Base.metadata.create_all(bind=engine)

# This is the exact "app" variable Uvicorn is looking for
app = FastAPI(title="Shop Management & POS API")

# Configure CORS to allow the React frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static directory for product images
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Connect the REST API endpoints
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(payments.router)
app.include_router(analytics.router)

# Basic health check endpoint
@app.get("/api/health")
def health_check():
    return {"status": "operational", "database": "connected"}