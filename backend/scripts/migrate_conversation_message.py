"""
Migration script to create conversation and message tables in the database.
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import SQLModel
from models.conversation import Conversation
from models.message import Message
from db import get_engine

def create_tables():
    """Create conversation and message tables."""
    engine = get_engine()
    SQLModel.metadata.create_all(engine)
    print("Tables created successfully!")

def main():
    """Run the migration."""
    print("Starting migration for conversation and message tables...")
    create_tables()
    print("Migration completed!")

if __name__ == "__main__":
    main()