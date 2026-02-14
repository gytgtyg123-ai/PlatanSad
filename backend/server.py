from fastapi import FastAPI, APIRouter, HTTPException, Query, UploadFile, File, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone
import json
import jwt
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'platansad-secret-key-2026')
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Create the main app
app = FastAPI(title="PlatanSad API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# =================== MODELS ===================

class Product(BaseModel):
    id: str
    name: str
    article: Optional[str] = None
    price: float
    old_price: Optional[float] = None
    discount: int = 0
    image: str
    category: str
    badges: List[str] = []
    description: Optional[str] = None
    stock: int = 10
    created_at: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    article: Optional[str] = None
    price: float
    old_price: Optional[float] = None
    discount: int = 0
    image: str
    category: str
    badges: List[str] = []
    description: Optional[str] = None
    stock: int = 10

class Category(BaseModel):
    id: str
    name: str
    icon: Optional[str] = None
    count: int = 0

class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = None

class CartItem(BaseModel):
    id: str
    product_id: str
    user_id: str
    quantity: int
    created_at: str

class CartItemAdd(BaseModel):
    productId: str
    quantity: int = 1
    userId: str = "guest"

class WishlistItem(BaseModel):
    id: str
    product_id: str
    user_id: str
    created_at: str

class WishlistItemAdd(BaseModel):
    productId: str
    userId: str = "guest"

class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    image: Optional[str] = None

class OrderCreate(BaseModel):
    items: List[OrderItem]
    customer: dict
    delivery: dict
    payment: str
    total: float
    comment: Optional[str] = None

class Order(BaseModel):
    id: str
    order_number: str
    items: List[OrderItem]
    customer: dict
    delivery: dict
    payment: str
    total: float
    status: str = "new"
    comment: Optional[str] = None
    created_at: str

class QuickOrderCreate(BaseModel):
    product_id: str
    product_name: str
    product_price: float
    customer_name: str
    customer_phone: str
    quantity: int = 1

class AdminLogin(BaseModel):
    username: str
    password: str

class StatusUpdate(BaseModel):
    status: str

class SiteSettingsUpdate(BaseModel):
    settings_data: dict

# =================== AUTH HELPERS ===================

def create_token(data: dict):
    return jwt.encode(data, JWT_SECRET, algorithm="HS256")

def verify_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except:
        return None

async def get_current_admin(authorization: str = None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.replace("Bearer ", "")
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

# =================== PRODUCTS ===================

@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    badges: Optional[str] = None,
    page: int = 1,
    limit: int = 500
):
    query = {}
    
    if category:
        query["category"] = category
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"article": {"$regex": search, "$options": "i"}}
        ]
    
    if min_price is not None:
        query["price"] = {"$gte": min_price}
    
    if max_price is not None:
        if "price" in query:
            query["price"]["$lte"] = max_price
        else:
            query["price"] = {"$lte": max_price}
    
    if badges:
        badge_list = badges.split(",")
        query["badges"] = {"$in": badge_list}
    
    # Sorting
    sort_field = [("created_at", -1)]
    if sort == "price_asc":
        sort_field = [("price", 1)]
    elif sort == "price_desc":
        sort_field = [("price", -1)]
    elif sort == "name":
        sort_field = [("name", 1)]
    
    skip = (page - 1) * limit
    products = await db.products.find(query, {"_id": 0}).sort(sort_field).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents(query)
    
    return {
        "products": products,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products")
async def create_product(product: ProductCreate):
    product_dict = product.model_dump()
    product_dict["id"] = f"prod-{uuid.uuid4().hex[:8]}"
    product_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(product_dict)
    return {k: v for k, v in product_dict.items() if k != "_id"}

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductCreate):
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": product.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated"}

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# =================== CATEGORIES ===================

@api_router.get("/categories")
async def get_categories():
    categories = await db.categories.find({}, {"_id": 0}).to_list(100)
    
    # Update counts
    for cat in categories:
        count = await db.products.count_documents({"category": cat["name"]})
        cat["count"] = count
    
    return categories

@api_router.get("/categories/{category_id}")
async def get_category(category_id: str):
    category = await db.categories.find_one({"id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@api_router.post("/admin/categories")
async def create_category(category: CategoryCreate):
    category_dict = category.model_dump()
    category_dict["id"] = f"cat-{uuid.uuid4().hex[:6]}"
    category_dict["count"] = 0
    await db.categories.insert_one(category_dict)
    return {k: v for k, v in category_dict.items() if k != "_id"}

@api_router.put("/admin/categories/{category_id}")
async def update_category(category_id: str, category: CategoryCreate):
    result = await db.categories.update_one(
        {"id": category_id},
        {"$set": category.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category updated"}

@api_router.delete("/admin/categories/{category_id}")
async def delete_category(category_id: str):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted"}

# =================== CART ===================

@api_router.get("/cart")
async def get_cart(userId: str = "guest"):
    cart_items = await db.cart.find({"user_id": userId}, {"_id": 0}).to_list(100)
    
    # Enrich with product data
    enriched = []
    for item in cart_items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            enriched.append({
                **item,
                "product": product
            })
    
    return enriched

@api_router.post("/cart/add")
async def add_to_cart(item: CartItemAdd):
    # Check if already in cart
    existing = await db.cart.find_one({
        "product_id": item.productId,
        "user_id": item.userId
    })
    
    if existing:
        await db.cart.update_one(
            {"id": existing["id"]},
            {"$inc": {"quantity": item.quantity}}
        )
        return {"message": "Quantity updated"}
    
    cart_item = {
        "id": f"cart-{uuid.uuid4().hex[:8]}",
        "product_id": item.productId,
        "user_id": item.userId,
        "quantity": item.quantity,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.cart.insert_one(cart_item)
    return {"message": "Added to cart", "id": cart_item["id"]}

@api_router.put("/cart/{item_id}")
async def update_cart_item(item_id: str, data: dict):
    result = await db.cart.update_one(
        {"id": item_id},
        {"$set": {"quantity": data.get("quantity", 1)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Cart updated"}

@api_router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str):
    result = await db.cart.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Removed from cart"}

@api_router.delete("/cart/clear/{user_id}")
async def clear_cart(user_id: str):
    await db.cart.delete_many({"user_id": user_id})
    return {"message": "Cart cleared"}

# =================== WISHLIST ===================

@api_router.get("/wishlist")
async def get_wishlist(userId: str = "guest"):
    items = await db.wishlist.find({"user_id": userId}, {"_id": 0}).to_list(100)
    
    enriched = []
    for item in items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            enriched.append({
                **item,
                "product": product
            })
    
    return enriched

@api_router.post("/wishlist/add")
async def add_to_wishlist(item: WishlistItemAdd):
    existing = await db.wishlist.find_one({
        "product_id": item.productId,
        "user_id": item.userId
    })
    
    if existing:
        return {"message": "Already in wishlist"}
    
    wishlist_item = {
        "id": f"wish-{uuid.uuid4().hex[:8]}",
        "product_id": item.productId,
        "user_id": item.userId,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.wishlist.insert_one(wishlist_item)
    return {"message": "Added to wishlist", "id": wishlist_item["id"]}

@api_router.delete("/wishlist/{item_id}")
async def remove_from_wishlist(item_id: str):
    result = await db.wishlist.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    return {"message": "Removed from wishlist"}

# =================== ORDERS ===================

@api_router.get("/orders")
async def get_orders(userId: str = "guest"):
    orders = await db.orders.find({"customer.userId": userId}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@api_router.post("/orders")
async def create_order(order: OrderCreate):
    # Generate order number
    count = await db.orders.count_documents({})
    order_number = f"PS-{count + 1001:05d}"
    
    order_dict = order.model_dump()
    order_dict["id"] = f"order-{uuid.uuid4().hex[:8]}"
    order_dict["order_number"] = order_number
    order_dict["status"] = "new"
    order_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.orders.insert_one(order_dict)
    
    return {
        "id": order_dict["id"],
        "order_number": order_number,
        "message": "Order created successfully"
    }

# =================== QUICK ORDERS ===================

@api_router.get("/quick-orders")
async def get_quick_orders():
    orders = await db.quick_orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.post("/quick-orders")
async def create_quick_order(order: QuickOrderCreate):
    order_dict = order.model_dump()
    order_dict["id"] = f"qo-{uuid.uuid4().hex[:8]}"
    order_dict["status"] = "new"
    order_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.quick_orders.insert_one(order_dict)
    return {"message": "Quick order created", "id": order_dict["id"]}

@api_router.put("/admin/quick-orders/{order_id}/status")
async def update_quick_order_status(order_id: str, data: StatusUpdate):
    result = await db.quick_orders.update_one(
        {"id": order_id},
        {"$set": {"status": data.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Quick order not found")
    return {"message": "Status updated"}

@api_router.delete("/admin/quick-orders/{order_id}")
async def delete_quick_order(order_id: str):
    result = await db.quick_orders.delete_one({"id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quick order not found")
    return {"message": "Quick order deleted"}

# =================== ADMIN ===================

@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    if credentials.username == ADMIN_USERNAME and credentials.password == ADMIN_PASSWORD:
        token = create_token({"username": credentials.username, "role": "admin"})
        return {"token": token, "message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.get("/admin/verify")
async def verify_admin(authorization: str = None):
    from fastapi import Header
    return {"valid": True}

@api_router.get("/admin/stats")
async def get_admin_stats():
    products_count = await db.products.count_documents({})
    orders_count = await db.orders.count_documents({})
    categories_count = await db.categories.count_documents({})
    
    # Revenue calculation
    orders = await db.orders.find({}, {"_id": 0, "total": 1}).to_list(1000)
    total_revenue = sum(o.get("total", 0) for o in orders)
    
    # New orders (last 7 days)
    from datetime import timedelta
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    new_orders = await db.orders.count_documents({"created_at": {"$gte": week_ago}})
    
    return {
        "products": products_count,
        "orders": orders_count,
        "categories": categories_count,
        "revenue": total_revenue,
        "newOrders": new_orders
    }

@api_router.get("/admin/orders")
async def get_all_orders(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    query = {}
    if status:
        query["status"] = status
    
    skip = (page - 1) * limit
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.orders.count_documents(query)
    
    return {
        "orders": orders,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, data: StatusUpdate):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": data.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Status updated"}

@api_router.delete("/admin/orders/{order_id}")
async def delete_order(order_id: str):
    result = await db.orders.delete_one({"id": order_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted"}

@api_router.get("/admin/revenue-chart")
async def get_revenue_chart(days: int = 7):
    from datetime import timedelta
    
    chart_data = []
    for i in range(days - 1, -1, -1):
        date = datetime.now(timezone.utc) - timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        
        # Find orders for this day
        start = date.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        end = date.replace(hour=23, minute=59, second=59, microsecond=999999).isoformat()
        
        orders = await db.orders.find({
            "created_at": {"$gte": start, "$lte": end}
        }, {"_id": 0, "total": 1}).to_list(1000)
        
        revenue = sum(o.get("total", 0) for o in orders)
        
        chart_data.append({
            "date": date_str,
            "revenue": revenue
        })
    
    return chart_data

@api_router.get("/admin/top-products")
async def get_top_products(limit: int = 5):
    # Get all orders and count product occurrences
    orders = await db.orders.find({}, {"_id": 0, "items": 1}).to_list(1000)
    
    product_sales = {}
    for order in orders:
        for item in order.get("items", []):
            pid = item.get("product_id")
            if pid:
                if pid not in product_sales:
                    product_sales[pid] = {"quantity": 0, "revenue": 0}
                product_sales[pid]["quantity"] += item.get("quantity", 1)
                product_sales[pid]["revenue"] += item.get("price", 0) * item.get("quantity", 1)
    
    # Get product details
    top = []
    for pid, stats in sorted(product_sales.items(), key=lambda x: x[1]["quantity"], reverse=True)[:limit]:
        product = await db.products.find_one({"id": pid}, {"_id": 0})
        if product:
            top.append({
                **product,
                "sold": stats["quantity"],
                "revenue": stats["revenue"]
            })
    
    return top

@api_router.get("/admin/orders/stats")
async def get_orders_stats():
    total = await db.orders.count_documents({})
    
    statuses = ["new", "processing", "shipped", "delivered", "cancelled"]
    status_counts = {}
    for s in statuses:
        status_counts[s] = await db.orders.count_documents({"status": s})
    
    orders = await db.orders.find({}, {"_id": 0, "total": 1}).to_list(1000)
    total_revenue = sum(o.get("total", 0) for o in orders)
    avg_order = total_revenue / total if total > 0 else 0
    
    return {
        "total": total,
        "by_status": status_counts,
        "total_revenue": total_revenue,
        "average_order": avg_order
    }

@api_router.get("/admin/orders/chart")
async def get_orders_chart(days: int = 7):
    from datetime import timedelta
    
    chart_data = []
    for i in range(days - 1, -1, -1):
        date = datetime.now(timezone.utc) - timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        
        start = date.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        end = date.replace(hour=23, minute=59, second=59, microsecond=999999).isoformat()
        
        count = await db.orders.count_documents({
            "created_at": {"$gte": start, "$lte": end}
        })
        
        chart_data.append({
            "date": date_str,
            "orders": count
        })
    
    return chart_data

@api_router.get("/admin/orders/by-status")
async def get_orders_by_status():
    statuses = ["new", "processing", "shipped", "delivered", "cancelled"]
    result = []
    for s in statuses:
        count = await db.orders.count_documents({"status": s})
        result.append({"status": s, "count": count})
    return result

@api_router.get("/admin/orders/top-customers")
async def get_top_customers(limit: int = 10):
    orders = await db.orders.find({}, {"_id": 0, "customer": 1, "total": 1}).to_list(1000)
    
    customers = {}
    for order in orders:
        phone = order.get("customer", {}).get("phone", "unknown")
        name = order.get("customer", {}).get("name", "Unknown")
        
        if phone not in customers:
            customers[phone] = {"name": name, "phone": phone, "orders": 0, "total": 0}
        
        customers[phone]["orders"] += 1
        customers[phone]["total"] += order.get("total", 0)
    
    return sorted(customers.values(), key=lambda x: x["total"], reverse=True)[:limit]

# =================== SITE SETTINGS ===================

@api_router.get("/settings")
async def get_public_settings():
    settings = await db.site_settings.find_one({"id": "main"}, {"_id": 0})
    return settings or {}

@api_router.get("/admin/site-settings")
async def get_admin_settings():
    settings = await db.site_settings.find_one({"id": "main"}, {"_id": 0})
    return settings.get("settings_data", {}) if settings else {}

@api_router.post("/admin/site-settings")
async def save_site_settings(data: SiteSettingsUpdate):
    await db.site_settings.update_one(
        {"id": "main"},
        {"$set": {"settings_data": data.settings_data}},
        upsert=True
    )
    return {"message": "Settings saved"}

# =================== IMAGE UPLOAD ===================

@api_router.post("/admin/upload-image")
async def upload_image(file: UploadFile = File(...)):
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    filepath = UPLOADS_DIR / filename
    
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    return {"url": f"/uploads/{filename}"}

# Serve uploaded files
@api_router.get("/uploads/{filename}")
async def serve_upload(filename: str):
    filepath = UPLOADS_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(filepath)

# =================== REVIEWS ===================

@api_router.get("/reviews")
async def get_reviews(product_id: Optional[str] = None):
    query = {}
    if product_id:
        query["product_id"] = product_id
    reviews = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reviews

@api_router.post("/reviews")
async def create_review(review: dict):
    review["id"] = f"rev-{uuid.uuid4().hex[:8]}"
    review["created_at"] = datetime.now(timezone.utc).isoformat()
    review["status"] = "pending"
    await db.reviews.insert_one(review)
    return {"message": "Review submitted", "id": review["id"]}

@api_router.get("/admin/reviews")
async def get_admin_reviews():
    reviews = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reviews

@api_router.put("/admin/reviews/{review_id}")
async def update_review(review_id: str, data: dict):
    result = await db.reviews.update_one(
        {"id": review_id},
        {"$set": data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review updated"}

@api_router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted"}

# =================== ROOT ===================

@api_router.get("/")
async def root():
    return {"message": "PlatanSad API v1.0", "status": "running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
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
