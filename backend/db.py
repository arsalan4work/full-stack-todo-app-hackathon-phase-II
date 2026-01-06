from sqlmodel import SQLModel, create_engine
from .models import Task, User  # Import the models explicitly to register them
import os


def get_engine():
    """Get database engine with URL from environment variable"""
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///todo_app.db")  # Use SQLite for development
    return create_engine(DATABASE_URL, echo=True)


def create_db_and_tables():
    """Create database tables for all models"""
    engine = get_engine()
    SQLModel.metadata.create_all(engine)