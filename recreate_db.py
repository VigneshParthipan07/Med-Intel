#!/usr/bin/env python3
"""
Script to recreate the database with the correct schema.
This will drop all existing tables and recreate them.
"""

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

# Import your app configuration
from app import app, db

def recreate_database():
    """Drop all tables and recreate them with the current model definitions"""
    
    print("🔄 Recreating database with correct schema...")
    
    with app.app_context():
        # Drop all existing tables
        print("📋 Dropping all existing tables...")
        db.drop_all()
        
        # Create all tables with current schema
        print("🏗️  Creating tables with new schema...")
        db.create_all()
        
        print("✅ Database recreated successfully!")
        
        # Show the tables that were created
        from sqlalchemy import text
        result = db.session.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = [row[0] for row in result.fetchall()]
        print(f"📊 Created tables: {', '.join(tables)}")

if __name__ == "__main__":
    recreate_database()
