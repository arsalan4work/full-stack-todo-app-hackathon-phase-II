from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Index
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.user import User  # Only for type hints

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: int = Field(default=None, primary_key=True, index=True)
    user_id: int = Field(foreign_key="users.id", nullable=False, index=True)
    title: str = Field(max_length=255, nullable=False)
    description: str | None = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship - use string annotation
    user: "User | None" = Relationship(back_populates="tasks")

    __table_args__ = (
        Index("idx_task_user_id", "user_id"),
        Index("idx_task_completed", "completed"),
    )