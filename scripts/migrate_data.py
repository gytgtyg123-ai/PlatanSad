#!/usr/bin/env python3
"""
Migration script to transfer data from SQLite backup to MongoDB
"""
import sqlite3
import json
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

# SQLite database path - use the correct database
SQLITE_DB = ROOT_DIR / 'platansad.db'

def migrate_table(table_name, collection_name=None):
    """Migrate a table from SQLite to MongoDB"""
    if collection_name is None:
        collection_name = table_name
    
    conn = sqlite3.connect(SQLITE_DB)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    
    if not rows:
        print(f"  No data in {table_name}")
        conn.close()
        return 0
    
    # Convert rows to dictionaries
    documents = []
    for row in rows:
        doc = dict(row)
        # Parse JSON fields
        for key, value in doc.items():
            if isinstance(value, str) and value.startswith('['):
                try:
                    doc[key] = json.loads(value)
                except:
                    pass
            elif isinstance(value, str) and value.startswith('{'):
                try:
                    doc[key] = json.loads(value)
                except:
                    pass
        documents.append(doc)
    
    # Clear existing collection and insert new data
    db[collection_name].delete_many({})
    result = db[collection_name].insert_many(documents)
    
    conn.close()
    return len(result.inserted_ids)

def main():
    print("=" * 50)
    print("PlatanSad Data Migration: SQLite -> MongoDB")
    print("=" * 50)
    
    if not SQLITE_DB.exists():
        print(f"ERROR: SQLite database not found at {SQLITE_DB}")
        return
    
    tables = [
        ('products', 'products'),
        ('categories', 'categories'),
        ('orders', 'orders'),
        ('quick_orders', 'quick_orders'),
        ('cart', 'cart'),
        ('wishlist', 'wishlist'),
        ('site_settings', 'site_settings'),
        ('reviews', 'reviews'),
        ('hero_sections', 'hero_sections'),
        ('blog_posts', 'blog_posts'),
        ('media_files', 'media_files'),
    ]
    
    total = 0
    for table, collection in tables:
        try:
            count = migrate_table(table, collection)
            print(f"✓ {table} -> {collection}: {count} documents")
            total += count
        except Exception as e:
            print(f"✗ {table}: {e}")
    
    print("=" * 50)
    print(f"Migration complete! Total documents: {total}")
    print("=" * 50)

if __name__ == "__main__":
    main()
