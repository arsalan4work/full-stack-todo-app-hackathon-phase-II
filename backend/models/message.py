from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Index
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from models.conversation import Conversation

class MessageRole:
    USER = "user"
    ASSISTANT = "assistant"

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    conversation_id: int = Field(foreign_key="conversations.id", nullable=False, index=True)
    user_id: str = Field(nullable=False, index=True)  # Indexed for quick lookup
    role: str = Field(max_length=20, nullable=False)  # "user" or "assistant"
    content: str = Field(max_length=10000, nullable=False)  # Up to 10,000 characters
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationship to conversation - many-to-one
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")

    __table_args__ = (
        Index("idx_message_conversation_id", "conversation_id"),
        Index("idx_message_user_id", "user_id"),
        Index("idx_message_created_at", "created_at"),
    )