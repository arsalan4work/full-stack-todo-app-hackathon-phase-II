"""Chat API schemas."""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict


class ChatRequest(BaseModel):
    """Schema for chat request."""
    conversation_id: Optional[int] = None
    message: str = Field(..., min_length=1, max_length=5000)


class ChatResponse(BaseModel):
    """Schema for chat response."""
    conversation_id: int
    response: str
    tool_calls: Optional[List[Dict]] = None