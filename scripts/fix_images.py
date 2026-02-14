#!/usr/bin/env python3
"""
Script to fix product images - use external prom.ua URLs
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

# Load environment
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

# Connect to MongoDB
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')

client = MongoClient(mongo_url)
db = client[db_name]

# Category to image mapping using external URLs
CATEGORY_IMAGES = {
    "Бонсай Нівакі": "https://images.prom.ua/6510283244_w640_h640_bonsaj-nivaki-pinus.jpg",
    "Туя Колумна": "https://images.prom.ua/5107358816_w640_h640_tuya-kolumna-columna.jpg",
    "Туя Смарагд": "https://images.prom.ua/5107353705_w640_h640_tuya-smaragd-smaragd.jpg",
    "Самшит": "https://images.prom.ua/5027226901_w640_h640_samshit-vichnozelenij-arborestsens.jpg",
    "Хвойні рослини": "https://images.prom.ua/713633902_w640_h640_hvojni-roslini.jpg",
    "Листопадні дерева та кущі": "https://images.prom.ua/701884790_w640_h640_listopadni-dereva-ta.jpg",
    "Куляста Туя Глобоса": "https://images.prom.ua/4858672644_w640_h640_kulyasta-tuya-globosa.jpg",
    "Катальпа": "https://images.prom.ua/4958829409_w640_h640_katalpa-catalpa.jpg",
    "Ялина": "https://images.prom.ua/5027326802_w640_h640_yalina.jpg",
    "Кімнатні рослини": "https://images.prom.ua/6901216283_w640_h640_kimnatni-roslini.jpg",
}

DEFAULT_IMAGE = "https://images.prom.ua/713633902_w640_h640_hvojni-roslini.jpg"

def fix_product_images():
    """Update product images to use proper external URLs"""
    products = list(db.products.find({}))
    
    updated = 0
    for product in products:
        category = product.get("category", "")
        current_image = product.get("image", "")
        
        # Check if image needs fixing (local path)
        if current_image.startswith("/var/") or current_image.startswith("/"):
            new_image = CATEGORY_IMAGES.get(category, DEFAULT_IMAGE)
            
            db.products.update_one(
                {"id": product["id"]},
                {"$set": {"image": new_image}}
            )
            updated += 1
            print(f"  Updated {product['name'][:40]}... -> {category}")
    
    return updated

def main():
    print("=" * 50)
    print("Fixing Product Images")
    print("=" * 50)
    
    updated = fix_product_images()
    
    print("=" * 50)
    print(f"Updated {updated} products with proper image URLs")
    print("=" * 50)

if __name__ == "__main__":
    main()
