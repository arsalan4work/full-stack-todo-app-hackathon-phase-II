from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel
from sqlalchemy import Column, DateTime, Index
from sqlmodel import Relationship


class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(sa_column=Column(DateTime, default=datetime.utcnow))
    updated_at: datetime = Field(sa_column=Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow))

    # Relationship to user
    user: "User" = Relationship(back_populates="tasks", sa_relationship_kwargs={"lazy": "select"})

    # Add indexes for performance
    __table_args__ = (
        Index("idx_task_user_id", "user_id"),
        Index("idx_task_completed", "completed"),
    )