---
name: sqlmodel-expert
description: Build database models with SQLModel - combining SQLAlchemy and Pydantic. Use for defining table models, schemas, relationships, and type-safe database operations. Perfect for FastAPI integration with PostgreSQL/SQLite.
---

# SQLModel Overview

## Instructions

SQLModel is a library for interacting with SQL databases from Python code, with Python objects. It combines SQLAlchemy and Pydantic for type-safe database models.

### 1. What is SQLModel?

SQLModel provides:
- **Type-safe** database models using Python type hints
- **Pydantic validation** built-in
- **SQLAlchemy** power under the hood
- **FastAPI integration** seamless
- **Automatic table creation** from models
- **Editor support** with autocomplete

### 2. Installation
```bash
# Install SQLModel
pip install sqlmodel

# With PostgreSQL driver
pip install sqlmodel psycopg2-binary

# Or with asyncpg for async support
pip install sqlmodel asyncpg

# Using UV (recommended for hackathon)
uv add sqlmodel psycopg2-binary
```

### 3. Basic Model Definition
```python
from sqlmodel import SQLModel, Field
from typing import Optional

class Todo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    completed: bool = Field(default=False)
```

**Key Components:**
- `SQLModel` - Base class for all models
- `table=True` - Mark as database table
- `Field()` - Configure column properties
- Type hints - Define data types

### 4. Database Connection
```python
# app/database.py
from sqlmodel import create_engine, SQLModel

# SQLite (for development)
DATABASE_URL = "sqlite:///./database.db"

# PostgreSQL (for production)
# DATABASE_URL = "postgresql://user:password@localhost/dbname"

engine = create_engine(
    DATABASE_URL,
    echo=True,  # Log SQL queries
    connect_args={"check_same_thread": False}  # SQLite only
)

def create_db_and_tables():
    """Create all tables in the database."""
    SQLModel.metadata.create_all(engine)
```

### 5. Database Session
```python
from sqlmodel import Session

# Create session
def get_session():
    with Session(engine) as session:
        yield session

# Usage in FastAPI
from fastapi import Depends

@app.get("/todos/")
def get_todos(session: Session = Depends(get_session)):
    # Use session here
    pass
```

### 6. CRUD Operations

**Create:**
```python
def create_todo(title: str, session: Session):
    todo = Todo(title=title)
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo
```

**Read:**
```python
from sqlmodel import select

def get_todos(session: Session):
    statement = select(Todo)
    todos = session.exec(statement).all()
    return todos

def get_todo_by_id(todo_id: int, session: Session):
    todo = session.get(Todo, todo_id)
    return todo
```

**Update:**
```python
def update_todo(todo_id: int, title: str, session: Session):
    todo = session.get(Todo, todo_id)
    if todo:
        todo.title = title
        session.add(todo)
        session.commit()
        session.refresh(todo)
    return todo
```

**Delete:**
```python
def delete_todo(todo_id: int, session: Session):
    todo = session.get(Todo, todo_id)
    if todo:
        session.delete(todo)
        session.commit()
    return {"deleted": True}
```

### 7. Field Types and Constraints
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Todo(SQLModel, table=True):
    # Primary key
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # String with constraints
    title: str = Field(min_length=1, max_length=100, index=True)
    
    # Optional string
    description: Optional[str] = Field(default=None, max_length=500)
    
    # Boolean with default
    completed: bool = Field(default=False)
    
    # Enum
    priority: Priority = Field(default=Priority.MEDIUM)
    
    # Integer with constraints
    score: int = Field(default=0, ge=0, le=100)
    
    # Float
    progress: float = Field(default=0.0, ge=0.0, le=1.0)
    
    # DateTime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Unique constraint
    slug: str = Field(unique=True, index=True)
```

### 8. Relationships

**One-to-Many:**
```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True)
    
    # Relationship
    todos: List["Todo"] = Relationship(back_populates="owner")

class Todo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    
    # Foreign key
    user_id: Optional[int] = Field(default=None, foreign_key="user.id")
    
    # Relationship
    owner: Optional[User] = Relationship(back_populates="todos")
```

**Many-to-Many:**
```python
class TodoTagLink(SQLModel, table=True):
    todo_id: Optional[int] = Field(
        default=None, foreign_key="todo.id", primary_key=True
    )
    tag_id: Optional[int] = Field(
        default=None, foreign_key="tag.id", primary_key=True
    )

class Todo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    
    tags: List["Tag"] = Relationship(
        back_populates="todos",
        link_model=TodoTagLink
    )

class Tag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True)
    
    todos: List[Todo] = Relationship(
        back_populates="tags",
        link_model=TodoTagLink
    )
```

### 9. Queries with Filtering
```python
from sqlmodel import select, col

# Simple filter
def get_completed_todos(session: Session):
    statement = select(Todo).where(Todo.completed == True)
    return session.exec(statement).all()

# Multiple conditions
def get_high_priority_incomplete(session: Session):
    statement = select(Todo).where(
        Todo.completed == False,
        Todo.priority == Priority.HIGH
    )
    return session.exec(statement).all()

# OR conditions
from sqlmodel import or_

def get_high_or_medium_priority(session: Session):
    statement = select(Todo).where(
        or_(
            Todo.priority == Priority.HIGH,
            Todo.priority == Priority.MEDIUM
        )
    )
    return session.exec(statement).all()

# LIKE search
def search_todos(query: str, session: Session):
    statement = select(Todo).where(
        col(Todo.title).contains(query)
    )
    return session.exec(statement).all()

# Ordering
def get_todos_by_date(session: Session):
    statement = select(Todo).order_by(Todo.created_at.desc())
    return session.exec(statement).all()

# Pagination
def get_todos_paginated(skip: int, limit: int, session: Session):
    statement = select(Todo).offset(skip).limit(limit)
    return session.exec(statement).all()
```

### 10. Model Inheritance and Schemas
```python
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

# Base model (not a table)
class TodoBase(SQLModel):
    title: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    completed: bool = Field(default=False)

# Database table model
class Todo(TodoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Create schema (input)
class TodoCreate(TodoBase):
    pass

# Update schema (all fields optional)
class TodoUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    completed: Optional[bool] = None

# Public schema (output)
class TodoPublic(TodoBase):
    id: int
    created_at: datetime
```

## Examples

### Example 1: Complete Todo Model with Validation
```python
# app/models/todo.py
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class TodoBase(SQLModel):
    """Base model with common fields."""
    title: str = Field(
        min_length=1,
        max_length=100,
        description="Todo title"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Todo description"
    )
    completed: bool = Field(
        default=False,
        description="Completion status"
    )
    priority: Priority = Field(
        default=Priority.MEDIUM,
        description="Priority level"
    )

class Todo(TodoBase, table=True):
    """Database table model."""
    __tablename__ = "todos"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )

class TodoCreate(TodoBase):
    """Schema for creating todos."""
    pass

class TodoUpdate(SQLModel):
    """Schema for updating todos."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[Priority] = None

class TodoPublic(TodoBase):
    """Schema for returning todos."""
    id: int
    created_at: datetime
    updated_at: datetime
```

### Example 2: User-Todo Relationship
```python
# app/models/user.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(unique=True, index=True, regex=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    password_hash: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    todos: List["Todo"] = Relationship(back_populates="owner")

# app/models/todo.py
from sqlmodel import Field, Relationship
from typing import Optional

class Todo(TodoBase, table=True):
    __tablename__ = "todos"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Foreign key
    user_id: int = Field(foreign_key="users.id", nullable=False)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    owner: User = Relationship(back_populates="todos")
```

### Example 3: Database Service Layer
```python
# app/services/todo_service.py
from sqlmodel import Session, select, col
from app.models.todo import Todo, TodoCreate, TodoUpdate
from typing import List, Optional
from datetime import datetime

class TodoService:
    """Service for Todo operations."""
    
    @staticmethod
    def create_todo(todo_data: TodoCreate, user_id: int, session: Session) -> Todo:
        """Create a new todo."""
        todo = Todo.from_orm(todo_data, update={"user_id": user_id})
        session.add(todo)
        session.commit()
        session.refresh(todo)
        return todo
    
    @staticmethod
    def get_todos(
        user_id: int,
        session: Session,
        skip: int = 0,
        limit: int = 100,
        completed: Optional[bool] = None
    ) -> List[Todo]:
        """Get todos with optional filtering."""
        statement = select(Todo).where(Todo.user_id == user_id)
        
        if completed is not None:
            statement = statement.where(Todo.completed == completed)
        
        statement = statement.offset(skip).limit(limit).order_by(Todo.created_at.desc())
        
        todos = session.exec(statement).all()
        return todos
    
    @staticmethod
    def get_todo_by_id(todo_id: int, user_id: int, session: Session) -> Optional[Todo]:
        """Get a specific todo."""
        statement = select(Todo).where(
            Todo.id == todo_id,
            Todo.user_id == user_id
        )
        todo = session.exec(statement).first()
        return todo
    
    @staticmethod
    def update_todo(
        todo_id: int,
        user_id: int,
        todo_data: TodoUpdate,
        session: Session
    ) -> Optional[Todo]:
        """Update a todo."""
        todo = TodoService.get_todo_by_id(todo_id, user_id, session)
        
        if not todo:
            return None
        
        # Update fields
        update_data = todo_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(todo, key, value)
        
        # Update timestamp
        todo.updated_at = datetime.utcnow()
        
        session.add(todo)
        session.commit()
        session.refresh(todo)
        return todo
    
    @staticmethod
    def delete_todo(todo_id: int, user_id: int, session: Session) -> bool:
        """Delete a todo."""
        todo = TodoService.get_todo_by_id(todo_id, user_id, session)
        
        if not todo:
            return False
        
        session.delete(todo)
        session.commit()
        return True
    
    @staticmethod
    def search_todos(query: str, user_id: int, session: Session) -> List[Todo]:
        """Search todos by title or description."""
        statement = select(Todo).where(
            Todo.user_id == user_id,
            col(Todo.title).contains(query) | col(Todo.description).contains(query)
        )
        todos = session.exec(statement).all()
        return todos
    
    @staticmethod
    def toggle_completed(todo_id: int, user_id: int, session: Session) -> Optional[Todo]:
        """Toggle todo completion status."""
        todo = TodoService.get_todo_by_id(todo_id, user_id, session)
        
        if not todo:
            return None
        
        todo.completed = not todo.completed
        todo.updated_at = datetime.utcnow()
        
        session.add(todo)
        session.commit()
        session.refresh(todo)
        return todo
```

### Example 4: Database Configuration
```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./database.db"
    
    # For PostgreSQL (Neon)
    # database_url: str = "postgresql://user:pass@host/db?sslmode=require"
    
    echo_sql: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()
```
```python
# app/database.py
from sqlmodel import create_engine, SQLModel, Session
from app.config import settings

# Create engine
engine = create_engine(
    settings.database_url,
    echo=settings.echo_sql,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)

def create_db_and_tables():
    """Create all database tables."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Get database session."""
    with Session(engine) as session:
        yield session

# Optional: Create tables on startup
def init_db():
    """Initialize database."""
    print("Creating database tables...")
    create_db_and_tables()
    print("Database tables created successfully!")
```

### Example 5: Neon Serverless PostgreSQL Setup
```bash
# .env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
ECHO_SQL=false
```
```python
# app/database.py
from sqlmodel import create_engine, SQLModel
from app.config import settings

# Neon-specific connection
engine = create_engine(
    settings.database_url,
    echo=settings.echo_sql,
    pool_pre_ping=True,  # Verify connections
    pool_size=5,         # Connection pool size
    max_overflow=10,     # Max overflow connections
)

def create_db_and_tables():
    """Create tables in Neon database."""
    SQLModel.metadata.create_all(engine)
```

### Example 6: Migration Script
```python
# scripts/migrate.py
"""Database migration script."""
from app.database import engine, create_db_and_tables
from app.models.todo import Todo
from app.models.user import User

def run_migrations():
    """Run database migrations."""
    print("Starting migrations...")
    
    # Drop all tables (development only!)
    # SQLModel.metadata.drop_all(engine)
    
    # Create all tables
    create_db_and_tables()
    
    print("Migrations completed successfully!")

if __name__ == "__main__":
    run_migrations()
```
```bash
# Run migration
uv run python scripts/migrate.py
```

## Best Practices

### ✅ DO:

1. **Use type hints everywhere**
```python
   id: Optional[int] = Field(default=None, primary_key=True)
```

2. **Separate base models from table models**
```python
   class TodoBase(SQLModel):  # Shared fields
       title: str
   
   class Todo(TodoBase, table=True):  # Table
       id: Optional[int] = Field(default=None, primary_key=True)
```

3. **Use Field constraints**
```python
   title: str = Field(min_length=1, max_length=100, index=True)
```

4. **Create separate schemas**
```python
   class TodoCreate(TodoBase): pass
   class TodoUpdate(SQLModel): pass
   class TodoPublic(TodoBase): pass
```

5. **Use service layer for business logic**
```python
   class TodoService:
       @staticmethod
       def create_todo(data, session):
           pass
```

6. **Always refresh after commit**
```python
   session.add(todo)
   session.commit()
   session.refresh(todo)  # Get updated data
```

### ❌ DON'T:

1. **Don't forget to set table=True**
```python
   # ❌ Bad - not a table
   class Todo(SQLModel):
       pass
   
   # ✅ Good - is a table
   class Todo(SQLModel, table=True):
       pass
```

2. **Don't use mutable defaults**
```python
   # ❌ Bad
   tags: List[str] = []
   
   # ✅ Good
   tags: List[str] = Field(default_factory=list)
```

3. **Don't skip validation**
```python
   # ✅ Always add constraints
   title: str = Field(min_length=1, max_length=100)
   email: str = Field(regex=r"^[\w\.-]+@[\w\.-]+\.\w+$")
```

4. **Don't forget foreign keys in relationships**
```python
   # ❌ Missing foreign key
   owner: User = Relationship()
   
   # ✅ With foreign key
   user_id: int = Field(foreign_key="users.id")
   owner: User = Relationship(back_populates="todos")
```

5. **Don't expose database models directly**
```python
   # ❌ Bad - returns database model
   @app.get("/todos/")
   def get_todos() -> List[Todo]:
       pass
   
   # ✅ Good - returns public schema
   @app.get("/todos/")
   def get_todos() -> List[TodoPublic]:
       pass
```

---

## Summary

SQLModel provides:
- 🎯 **Type safety** - Full Python type hints
- ✅ **Validation** - Built-in Pydantic validation
- 🔗 **Relationships** - Easy one-to-many, many-to-many
- 🚀 **FastAPI integration** - Seamless API building
- 📊 **SQLAlchemy power** - Advanced queries
- 🛠️ **Easy CRUD** - Simple database operations
- 📝 **Auto documentation** - API docs from models
- 🔒 **Production ready** - Used in real applications

Use SQLModel for all database operations in your FastAPI applications with type-safe, validated models.