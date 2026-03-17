from reportlab.lib.pagesizes import A6 # Standard small receipt size
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from io import BytesIO
from datetime import datetime

def generate_receipt_pdf(sale, items):
    buffer = BytesIO()
    # A6 is perfect for thermal printers or small handouts
    c = canvas.Canvas(buffer, pagesize=A6)
    width, height = A6

    # 1. Header & Branding
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width/2, height - 15*mm, "SHOPMASTER RETAIL")
    
    c.setFont("Helvetica", 8)
    c.drawCentredString(width/2, height - 20*mm, "Nairobi, Kenya | Tel: +254 700 000 000")
    c.line(10*mm, height - 25*mm, width - 10*mm, height - 25*mm)

    # 2. Transaction Info
    c.setFont("Helvetica-Bold", 9)
    c.drawString(10*mm, height - 32*mm, f"Receipt: #{sale.sale_id}")
    c.setFont("Helvetica", 8)
    c.drawRightString(width - 10*mm, height - 32*mm, f"Date: {sale.sale_date.strftime('%d/%m/%Y %H:%M')}")
    c.drawString(10*mm, height - 37*mm, f"M-Pesa Ref: {sale.mpesa_receipt_number or 'N/A'}")

    # 3. Table Header
    y = height - 45*mm
    c.setFont("Helvetica-Bold", 8)
    c.drawString(10*mm, y, "Item")
    c.drawRightString(width - 35*mm, y, "Qty")
    c.drawRightString(width - 10*mm, y, "Total")
    c.line(10*mm, y - 2*mm, width - 10*mm, y - 2*mm)

    # 4. Items List
    y -= 7*mm
    c.setFont("Helvetica", 8)
    for item in items:
        # Product name (truncated if too long)
        name = (item.product.product_name[:18] + '..') if len(item.product.product_name) > 18 else item.product.product_name
        c.drawString(10*mm, y, name)
        c.drawRightString(width - 35*mm, y, str(item.quantity))
        c.drawRightString(width - 10*mm, y, f"{item.subtotal:,.2f}")
        y -= 5*mm
        if y < 20*mm: # Basic page break logic
            c.showPage()
            y = height - 20*mm

    # 5. Totals Section
    c.line(10*mm, y, width - 10*mm, y)
    y -= 6*mm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(10*mm, y, "TOTAL AMOUNT")
    c.drawRightString(width - 10*mm, y, f"Ksh {sale.total_amount:,.2f}")

    # 6. Footer
    c.setFont("Helvetica-Oblique", 7)
    c.drawCentredString(width/2, 10*mm, "Thank you for shopping with us!")
    c.drawCentredString(width/2, 6*mm, "Goods once sold are not returnable.")

    c.save()
    buffer.seek(0)
    return buffer