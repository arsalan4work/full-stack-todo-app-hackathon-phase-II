from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_engine():
    """Get database engine with URL from environment variable"""
    DATABASE_URL = os.getenv("DATABASE_URL")  # fallback to SQLite

    echo_logs = os.getenv("ENVIRONMENT") == "development"

    if "postgresql" in DATABASE_URL:
        return create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            pool_recycle=300,
            echo=echo_logs
        )
    else:
        return create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
            echo=echo_logs
        )

def get_session():
    """Get database session - for dependency injection"""
    engine = get_engine()
    session = Session(engine)
    try:
        yield session
    finally:
        session.close()

def create_db_and_tables():
    """Create database tables for all models"""
    engine = get_engine()
    # Import models here to avoid circular import
    from models.user import User
    from models.task import Task
    from models.conversation import Conversation
    from models.message import Message
    SQLModel.metadata.create_all(engine)
