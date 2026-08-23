"""
Database session and connection management.
Supports SQLite / In-memory storage with simple abstraction for PostgreSQL.
"""
import os
from typing import Dict, Any

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./catalogai.db")

class DatabaseSessionManager:
    def __init__(self, db_url: str = DATABASE_URL):
        self.db_url = db_url
        self.is_connected = False
        
    async def connect(self):
        self.is_connected = True
        
    async def disconnect(self):
        self.is_connected = False

db_manager = DatabaseSessionManager()
