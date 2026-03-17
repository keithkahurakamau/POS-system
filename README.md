# POS-system
RESTful Shop Management and POS System. The solution optimizes for strict REST adherence, high-throughput POS operations, and secure transactional integrity through MPESA callback funtions.
# Shop Management and POS System

A high-throughput, full-stack Point of Sale (POS) and inventory management system designed for small retail environments. The architecture adheres strictly to RESTful principles, decoupling a React.js client from a Python FastAPI server, with persistent state managed by PostgreSQL.

## Architecture Specification
* **Frontend:** React.js (Vite compiler), Chart.js (Analytics)
* **Backend:** Python 3.10+, FastAPI, SQLAlchemy (ORM), Pydantic (Validation)
* **Database:** PostgreSQL
* **External Integration:** Safaricom Daraja API (M-Pesa STK Push)

## System Prerequisites
* Node.js (v18.x or higher)
* Python (3.10 or higher)
* PostgreSQL server running on `localhost:5432`

## Local Environment Bootstrap

### 1. Database Initialization
Ensure PostgreSQL is active. Create the target database:
```sql
CREATE DATABASE shop_management;