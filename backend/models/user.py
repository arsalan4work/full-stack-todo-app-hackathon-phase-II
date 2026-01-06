from datetime import datetime
from typing import Optional, List
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, DateTime, Index
from sqlmodel import Relationship


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(sa_column=Column(DateTime, default=datetime.utcnow))
    updated_at: datetime = Field(sa_column=Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow))
    is_active: bool = Field(default=True)

    # Relationship to tasks
    tasks: List["Task"] = Relationship(back_populates="user", sa_relationship_kwargs={"lazy": "select"})

    # Add indexes for performance
    __table_args__ = (
        Index("idx_user_email", "email"),
    )