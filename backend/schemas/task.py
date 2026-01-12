from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Task title (1-200 characters)")
    description: Optional[str] = Field(None, max_length=1000, description="Optional task description")


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Task title (1-200 characters)")
    description: Optional[str] = Field(None, max_length=1000, description="Optional task description")


class TaskResponse(BaseModel):
    id: Optional[int] = None
    user_id: int
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: datetime

    class Config:
        from_attributes = True