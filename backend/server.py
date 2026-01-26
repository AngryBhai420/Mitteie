from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, Response, Request, status
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import os
import logging
from pathlib import Path
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import cloudinary
import cloudinary.utils
import time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ========== MODELS ==========

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime

class Item(BaseModel):
    model_config = ConfigDict(extra="ignore")
    item_id: str
    user_id: str
    navn: str
    kategori: Optional[str] = None
    serienummer: Optional[str] = None
    notat: Optional[str] = None
    verdi: Optional[float] = None
    valuta: str = "NOK"
    vedlegg_urls: List[str] = []
    created_at: datetime
    updated_at: datetime

# ========== REQUEST/RESPONSE MODELS ==========

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class EmergentSessionRequest(BaseModel):
    session_id: str

class ItemCreate(BaseModel):
    navn: str
    kategori: Optional[str] = None
    serienummer: Optional[str] = None
    notat: Optional[str] = None
    verdi: Optional[float] = None
    valuta: str = "NOK"
    vedlegg_urls: List[str] = []

class ItemUpdate(BaseModel):
    navn: Optional[str] = None
    kategori: Optional[str] = None
    serienummer: Optional[str] = None
    notat: Optional[str] = None
    verdi: Optional[float] = None
    valuta: Optional[str] = None
    vedlegg_urls: Optional[List[str]] = None

# ========== AUTH HELPER ==========

async def get_current_user(request: Request) -> User:
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            session_token = auth_header[7:]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert timestamp
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

# ========== AUTH ROUTES ==========

@api_router.post("/auth/signup")
async def signup(data: SignupRequest, response: Response):
    # Check if user exists
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    password_hash = pwd_context.hash(data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": password_hash,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "picture": None
    }

@api_router.post("/auth/login")
async def login(data: LoginRequest, response: Response):
    # Find user
    user_doc = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not pwd_context.verify(data.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create session
    session_token = f"session_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "user_id": user_doc["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {
        "user_id": user_doc["user_id"],
        "email": user_doc["email"],
        "name": user_doc["name"],
        "picture": user_doc.get("picture")
    }

@api_router.post("/auth/session")
async def exchange_emergent_session(data: EmergentSessionRequest, response: Response):
    import requests
    
    # Exchange session_id for user data
    resp = requests.get(
        "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
        headers={"X-Session-ID": data.session_id}
    )
    
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid session_id")
    
    session_data = resp.json()
    
    # Find or create user
    user_doc = await db.users.find_one({"email": session_data["email"]}, {"_id": 0})
    
    if user_doc:
        # Update existing user
        await db.users.update_one(
            {"email": session_data["email"]},
            {"$set": {
                "name": session_data["name"],
                "picture": session_data.get("picture")
            }}
        )
        user_id = user_doc["user_id"]
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": session_data["email"],
            "name": session_data["name"],
            "picture": session_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
    
    # Create session using token from Emergent
    session_token = session_data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    return {
        "user_id": user_id,
        "email": session_data["email"],
        "name": session_data["name"],
        "picture": session_data.get("picture")
    }

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    
    return {"message": "Logged out"}

# ========== CLOUDINARY ROUTES ==========

@api_router.get("/cloudinary/signature")
async def generate_cloudinary_signature(
    resource_type: str = Query("image", regex="^(image|raw)$"),
    folder: str = "mitteie",
    _: User = Depends(get_current_user)
):
    timestamp = int(time.time())
    params = {
        "timestamp": timestamp,
        "folder": folder,
        "resource_type": resource_type
    }
    
    signature = cloudinary.utils.api_sign_request(
        params,
        os.getenv("CLOUDINARY_API_SECRET")
    )
    
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME"),
        "api_key": os.getenv("CLOUDINARY_API_KEY"),
        "folder": folder,
        "resource_type": resource_type
    }

# ========== ITEM ROUTES ==========

@api_router.get("/items", response_model=List[Item])
async def get_items(user: User = Depends(get_current_user)):
    items = await db.items.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).to_list(1000)
    
    # Convert timestamps
    for item in items:
        if isinstance(item['created_at'], str):
            item['created_at'] = datetime.fromisoformat(item['created_at'])
        if isinstance(item['updated_at'], str):
            item['updated_at'] = datetime.fromisoformat(item['updated_at'])
    
    return items

@api_router.post("/items", response_model=Item, status_code=201)
async def create_item(data: ItemCreate, user: User = Depends(get_current_user)):
    item_id = f"item_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    
    item_doc = {
        "item_id": item_id,
        "user_id": user.user_id,
        "navn": data.navn,
        "kategori": data.kategori,
        "serienummer": data.serienummer,
        "notat": data.notat,
        "verdi": data.verdi,
        "valuta": data.valuta,
        "vedlegg_urls": data.vedlegg_urls,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.items.insert_one(item_doc)
    
    return Item(
        item_id=item_id,
        user_id=user.user_id,
        navn=data.navn,
        kategori=data.kategori,
        serienummer=data.serienummer,
        notat=data.notat,
        verdi=data.verdi,
        valuta=data.valuta,
        vedlegg_urls=data.vedlegg_urls,
        created_at=now,
        updated_at=now
    )

@api_router.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: str, user: User = Depends(get_current_user)):
    item_doc = await db.items.find_one(
        {"item_id": item_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not item_doc:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Convert timestamps
    if isinstance(item_doc['created_at'], str):
        item_doc['created_at'] = datetime.fromisoformat(item_doc['created_at'])
    if isinstance(item_doc['updated_at'], str):
        item_doc['updated_at'] = datetime.fromisoformat(item_doc['updated_at'])
    
    return Item(**item_doc)

@api_router.put("/items/{item_id}", response_model=Item)
async def update_item(
    item_id: str,
    data: ItemUpdate,
    user: User = Depends(get_current_user)
):
    # Check ownership
    existing = await db.items.find_one(
        {"item_id": item_id, "user_id": user.user_id}
    )
    
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Build update dict
    update_dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if data.navn is not None:
        update_dict["navn"] = data.navn
    if data.kategori is not None:
        update_dict["kategori"] = data.kategori
    if data.serienummer is not None:
        update_dict["serienummer"] = data.serienummer
    if data.notat is not None:
        update_dict["notat"] = data.notat
    if data.verdi is not None:
        update_dict["verdi"] = data.verdi
    if data.valuta is not None:
        update_dict["valuta"] = data.valuta
    if data.vedlegg_urls is not None:
        update_dict["vedlegg_urls"] = data.vedlegg_urls
    
    await db.items.update_one(
        {"item_id": item_id},
        {"$set": update_dict}
    )
    
    # Fetch updated item
    item_doc = await db.items.find_one(
        {"item_id": item_id},
        {"_id": 0}
    )
    
    # Convert timestamps
    if isinstance(item_doc['created_at'], str):
        item_doc['created_at'] = datetime.fromisoformat(item_doc['created_at'])
    if isinstance(item_doc['updated_at'], str):
        item_doc['updated_at'] = datetime.fromisoformat(item_doc['updated_at'])
    
    return Item(**item_doc)

@api_router.delete("/items/{item_id}")
async def delete_item(item_id: str, user: User = Depends(get_current_user)):
    result = await db.items.delete_one(
        {"item_id": item_id, "user_id": user.user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return {"message": "Item deleted"}


# ========== STRIPE PAYMENT ROUTES ==========

from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

# Fixed payment packages - NEVER accept amounts from frontend
PAYMENT_PACKAGES = {
    "subscription": {"amount": 49.0, "currency": "NOK", "description": "Månedlig abonnement"},
    "import": {"amount": 29.0, "currency": "NOK", "description": "Engangstillegg for PDF-import"}
}

class PaymentRequest(BaseModel):
    package_id: str
    origin_url: str

@api_router.post("/payments/checkout")
async def create_checkout_session(data: PaymentRequest, user: User = Depends(get_current_user)):
    # Validate package
    if data.package_id not in PAYMENT_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    package = PAYMENT_PACKAGES[data.package_id]
    
    # Initialize Stripe
    stripe_api_key = os.getenv("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    webhook_url = f"{data.origin_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    # Create checkout session
    success_url = f"{data.origin_url}/payment-success?session_id={{{{CHECKOUT_SESSION_ID}}}}"
    cancel_url = f"{data.origin_url}/dashboard"
    
    checkout_request = CheckoutSessionRequest(
        amount=package["amount"],
        currency=package["currency"].lower(),
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": user.user_id,
            "package_id": data.package_id,
            "description": package["description"]
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "session_id": session.session_id,
        "user_id": user.user_id,
        "package_id": data.package_id,
        "amount": package["amount"],
        "currency": package["currency"],
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, user: User = Depends(get_current_user)):
    # Check if transaction exists
    transaction = await db.payment_transactions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # If already completed, return cached status
    if transaction.get("payment_status") == "paid":
        return {"status": "complete", "payment_status": "paid", "package_id": transaction["package_id"]}
    
    # Poll Stripe for status
    stripe_api_key = os.getenv("STRIPE_API_KEY")
    webhook_url = f"https://dummy-webhook.com/stripe"  # Not used for status check
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction if payment succeeded
    if checkout_status.payment_status == "paid" and transaction.get("payment_status") != "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {
                "payment_status": "paid",
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Update user subscription status if subscription package
        if transaction["package_id"] == "subscription":
            await db.users.update_one(
                {"user_id": user.user_id},
                {"$set": {
                    "subscription_status": "active",
                    "subscription_started_at": datetime.now(timezone.utc).isoformat()
                }}
            )
    
    return {
        "status": checkout_status.status,
        "payment_status": checkout_status.payment_status,
        "package_id": transaction["package_id"]
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    # Webhook handler for Stripe events
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    stripe_api_key = os.getenv("STRIPE_API_KEY")
    webhook_url = f"{request.base_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction status based on webhook
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "payment_status": "paid",
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Webhook processing failed")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"] if os.environ.get('CORS_ORIGINS') == '*' else os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"https://.*\.emergentagent\.com" if os.environ.get('CORS_ORIGINS') == '*' else None,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
