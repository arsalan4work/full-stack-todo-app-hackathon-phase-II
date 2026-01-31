from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Index
from typing import TYPE_CHECKING, Optional, List

if TYPE_CHECKING:
    from models.message import Message

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    user_id: str = Field(nullable=False, index=True)  # Foreign key to users
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationship to messages - one-to-many
    messages: List["Message"] = Relationship(back_populates="conversation")

    __table_args__ = (
        Index("idx_conversation_user_id", "user_id"),
        Index("idx_conversation_created_at", "created_at"),
    )