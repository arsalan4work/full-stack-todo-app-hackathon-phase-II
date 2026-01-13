from sqlmodel import create_engine, Session
from models import User, Task  # Import your SQLModel models
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def get_engine():
    """Get database engine with URL from environment variable"""
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo_app.db")  # Fallback to SQLite for local dev

    # For production, disable echo (logging) and adjust pool settings
    echo_logs = os.getenv("ENVIRONMENT") == "development"

    if "postgresql" in DATABASE_URL:
        # PostgreSQL settings for production
        return create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            pool_recycle=300,
            echo=echo_logs
        )
    else:
        # SQLite settings for local development
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
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(engine)