import httpx, base64
from datetime import datetime
from app.config import settings

async def get_mpesa_access_token() -> str:
    consumer_key = settings.MPESA_CONSUMER_KEY
    consumer_secret = settings.MPESA_CONSUMER_SECRET
    api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(api_url, auth=(consumer_key, consumer_secret))
        response.raise_for_status()
        return response.json()["access_token"]

async def initiate_stk_push(phone_number: str, amount: float, account_reference: str) -> dict:
    access_token = await get_mpesa_access_token()
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password_str = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
    password = base64.b64encode(password_str.encode()).decode('utf-8')

    payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": settings.MPESA_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": account_reference,
        "TransactionDesc": "POS Checkout"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            json=payload, headers={"Authorization": f"Bearer {access_token}"}
        )
        return response.json()