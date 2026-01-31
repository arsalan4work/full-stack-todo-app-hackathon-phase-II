---
name: fastapi-expert-skill
description: Build modern Python APIs with FastAPI. Use for creating REST APIs, handling async operations, automatic OpenAPI documentation, and type-safe endpoints. Perfect for backend services with Python 3.10+.
---

# FastAPI Overview

## Instructions

FastAPI is a modern, fast (high-performance) web framework for building APIs with Python 3.10+ based on standard Python type hints.

### 1. What is FastAPI?

FastAPI is a Python web framework for building APIs that provides:
- **Automatic API documentation** (Swagger UI & ReDoc)
- **Type safety** with Pydantic models
- **Async support** for high performance
- **Data validation** built-in
- **Dependency injection** system
- **OAuth2 and JWT** authentication

### 2. Installation
```bash
# Install FastAPI and Uvicorn (ASGI server)
pip install fastapi uvicorn

# Or with specific versions
pip install "fastapi[all]" uvicorn[standard]

# Using UV (recommended for this hackathon)
uv add fastapi uvicorn[standard]
```

### 3. Project Structure
```
fastapi-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Entry point
│   ├── config.py            # Configuration
│   ├── database.py          # Database setup
│   ├── models/              # SQLModel models
│   │   ├── __init__.py
│   │   └── todo.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   └── todo.py
│   ├── routers/             # API routes
│   │   ├── __init__.py
│   │   └── todos.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   └── todo_service.py
│   └── dependencies/        # Dependency injection
│       ├── __init__.py
│       └── auth.py
├── tests/
│   ├── __init__.py
│   └── test_todos.py
├── .env
├── requirements.txt
└── README.md
```

### 4. Basic FastAPI Application
```python
# app/main.py
from fastapi import FastAPI

app = FastAPI(
    title="Todo API",
    description="A simple Todo API built with FastAPI",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

### 5. Run Development Server
```bash
# Run with Uvicorn
uvicorn app.main:app --reload

# Or with custom host and port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Using UV
uv run uvicorn app.main:app --reload
```

**Access:**
- API: `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`
- Alternative docs: `http://localhost:8000/redoc`

### 6. Key FastAPI Features

**Path Parameters:**
```python
@app.get("/items/{item_id}")
def read_item(item_id: int):
    return {"item_id": item_id}
```

**Query Parameters:**
```python
@app.get("/items/")
def read_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}
```

**Request Body:**
```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    is_offer: bool = False

@app.post("/items/")
def create_item(item: Item):
    return item
```

**Response Model:**
```python
@app.get("/items/{item_id}", response_model=Item)
def read_item(item_id: int):
    return {"name": "Item", "price": 10.5, "is_offer": False}
```

### 7. Async Operations
```python
@app.get("/async-items/")
async def read_async_items():
    # Async database query
    items = await db.fetch_all("SELECT * FROM items")
    return items

@app.post("/async-items/")
async def create_async_item(item: Item):
    # Async database insert
    await db.execute("INSERT INTO items VALUES (...)")
    return {"success": True}
```

### 8. Database Integration (SQLModel)
```python
# app/database.py
from sqlmodel import create_engine, SQLModel, Session

DATABASE_URL = "postgresql://user:pass@localhost/dbname"

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
```

### 9. Dependency Injection
```python
from fastapi import Depends
from sqlmodel import Session

@app.get("/items/")
def read_items(session: Session = Depends(get_session)):
    items = session.exec(select(Item)).all()
    return items
```

### 10. Error Handling
```python
from fastapi import HTTPException

@app.get("/items/{item_id}")
def read_item(item_id: int):
    item = get_item_from_db(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
```

## Examples

### Example 1: Complete Todo API
```python
# app/main.py
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Todo API")

# In-memory database
todos_db = []
todo_id_counter = 1

# Pydantic models
class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class Todo(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    completed: bool = False

# Routes
@app.get("/todos/", response_model=List[Todo])
def get_todos():
    return todos_db

@app.post("/todos/", response_model=Todo, status_code=201)
def create_todo(todo: TodoCreate):
    global todo_id_counter
    new_todo = Todo(
        id=todo_id_counter,
        title=todo.title,
        description=todo.description,
        completed=False
    )
    todos_db.append(new_todo)
    todo_id_counter += 1
    return new_todo

@app.get("/todos/{todo_id}", response_model=Todo)
def get_todo(todo_id: int):
    for todo in todos_db:
        if todo.id == todo_id:
            return todo
    raise HTTPException(status_code=404, detail="Todo not found")

@app.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, todo_update: TodoUpdate):
    for idx, todo in enumerate(todos_db):
        if todo.id == todo_id:
            updated_data = todo_update.dict(exclude_unset=True)
            updated_todo = todo.copy(update=updated_data)
            todos_db[idx] = updated_todo
            return updated_todo
    raise HTTPException(status_code=404, detail="Todo not found")

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    for idx, todo in enumerate(todos_db):
        if todo.id == todo_id:
            todos_db.pop(idx)
            return {"message": "Todo deleted"}
    raise HTTPException(status_code=404, detail="Todo not found")
```

### Example 2: With SQLModel Database
```python
# app/models/todo.py
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class TodoBase(SQLModel):
    title: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    completed: bool = Field(default=False)

class Todo(TodoBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TodoCreate(TodoBase):
    pass

class TodoUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    completed: Optional[bool] = None

class TodoPublic(TodoBase):
    id: int
    created_at: datetime
    updated_at: datetime
```
```python
# app/routers/todos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models.todo import Todo, TodoCreate, TodoUpdate, TodoPublic
from app.database import get_session
from typing import List

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/", response_model=List[TodoPublic])
def get_todos(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    statement = select(Todo).offset(skip).limit(limit)
    todos = session.exec(statement).all()
    return todos

@router.post("/", response_model=TodoPublic, status_code=201)
def create_todo(
    todo: TodoCreate,
    session: Session = Depends(get_session)
):
    db_todo = Todo.from_orm(todo)
    session.add(db_todo)
    session.commit()
    session.refresh(db_todo)
    return db_todo

@router.get("/{todo_id}", response_model=TodoPublic)
def get_todo(todo_id: int, session: Session = Depends(get_session)):
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@router.put("/{todo_id}", response_model=TodoPublic)
def update_todo(
    todo_id: int,
    todo_update: TodoUpdate,
    session: Session = Depends(get_session)
):
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    todo_data = todo_update.dict(exclude_unset=True)
    for key, value in todo_data.items():
        setattr(todo, key, value)
    
    todo.updated_at = datetime.utcnow()
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo

@router.delete("/{todo_id}")
def delete_todo(todo_id: int, session: Session = Depends(get_session)):
    todo = session.get(Todo, todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    session.delete(todo)
    session.commit()
    return {"message": "Todo deleted"}
```
```python
# app/main.py
from fastapi import FastAPI
from app.routers import todos
from app.database import create_db_and_tables

app = FastAPI(title="Todo API with Database")

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(todos.router)

@app.get("/")
def read_root():
    return {"message": "Todo API"}
```

### Example 3: CORS Configuration
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "CORS enabled"}
```

### Example 4: Environment Configuration
```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Todo API"
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"

settings = Settings()
```
```bash
# .env
DATABASE_URL=postgresql://user:pass@localhost/dbname
SECRET_KEY=your-secret-key-here
```
```python
# Usage
from app.config import settings

print(settings.database_url)
print(settings.secret_key)
```

### Example 5: Request Validation
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, validator

app = FastAPI()

class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=500)
    priority: int = Field(..., ge=1, le=5)
    
    @validator('title')
    def title_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()
    
    @validator('description')
    def description_cleanup(cls, v):
        if v:
            return v.strip()
        return v

@app.post("/todos/")
def create_todo(todo: TodoCreate):
    return todo
```

### Example 6: Background Tasks
```python
from fastapi import BackgroundTasks

def send_notification(email: str, message: str):
    # Simulate sending email
    print(f"Sending email to {email}: {message}")

@app.post("/todos/")
def create_todo(
    todo: TodoCreate,
    background_tasks: BackgroundTasks
):
    # Create todo
    new_todo = create_todo_in_db(todo)
    
    # Send notification in background
    background_tasks.add_task(
        send_notification,
        "user@example.com",
        f"Todo '{todo.title}' created"
    )
    
    return new_todo
```

## Best Practices

### ✅ DO:

1. **Use type hints everywhere**
```python
   def get_todo(todo_id: int) -> Todo:
       pass
```

2. **Use Pydantic models for validation**
```python
   class TodoCreate(BaseModel):
       title: str = Field(..., min_length=1)
```

3. **Use dependency injection**
```python
   def get_todos(session: Session = Depends(get_session)):
       pass
```

4. **Use async for I/O operations**
```python
   async def get_todos():
       return await db.fetch_all()
```

5. **Use routers for organization**
```python
   router = APIRouter(prefix="/todos", tags=["todos"])
   app.include_router(router)
```

### ❌ DON'T:

1. **Don't skip validation**
```python
   # ❌ Bad - no validation
   @app.post("/todos/")
   def create_todo(data: dict):
       pass
   
   # ✅ Good - with Pydantic
   @app.post("/todos/")
   def create_todo(todo: TodoCreate):
       pass
```

2. **Don't hardcode configuration**
```python
   # ❌ Bad
   DATABASE_URL = "postgresql://localhost/db"
   
   # ✅ Good
   from app.config import settings
   DATABASE_URL = settings.database_url
```

3. **Don't ignore error handling**
```python
   # ✅ Always handle errors
   if not todo:
       raise HTTPException(status_code=404, detail="Not found")
```

---

## Summary

FastAPI provides:
- 🚀 **High performance** - As fast as NodeJS and Go
- 📚 **Auto documentation** - Interactive API docs
- ✅ **Type safety** - Python type hints
- 🔒 **Data validation** - Pydantic models
- ⚡ **Async support** - High concurrency
- 🔌 **Easy integration** - Works with any DB
- 🛠️ **Developer friendly** - Great DX
- 📊 **Production ready** - Used by Uber, Netflix

For detailed topics, refer to the specific skill files in this directory.