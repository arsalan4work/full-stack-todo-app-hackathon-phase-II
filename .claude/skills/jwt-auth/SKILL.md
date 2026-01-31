---
name: jwt-auth-expert
description: Implement JWT (JSON Web Token) authentication for FastAPI applications. Use for secure user authentication, token generation, validation, refresh tokens, and protected routes. Includes password hashing with bcrypt.
---

# JWT Token Authentication

## Instructions

JWT (JSON Web Token) is a secure way to transmit information between parties as a JSON object. Use it for stateless authentication in your FastAPI applications.

### 1. What is JWT Authentication?

JWT authentication provides:
- **Stateless** - No server-side session storage
- **Secure** - Cryptographically signed tokens
- **Scalable** - Works across multiple servers
- **Self-contained** - Contains all user info
- **Expirable** - Tokens have time limits

**JWT Structure:**
```
header.payload.signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### 2. Installation
```bash
# Install required packages
pip install python-jose[cryptography] passlib[bcrypt] python-multipart

# Using UV (recommended)
uv add "python-jose[cryptography]" "passlib[bcrypt]" python-multipart
```

**Dependencies:**
- `python-jose` - JWT token creation and validation
- `passlib` - Password hashing with bcrypt
- `python-multipart` - Form data parsing

### 3. Configuration
```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # JWT Settings
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    class Config:
        env_file = ".env"

settings = Settings()
```
```bash
# .env
SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**Generate Secret Key:**
```bash
# Generate a secure secret key
openssl rand -hex 32
```

### 4. Password Hashing
```python
# app/security/password.py
from passlib.context import CryptContext

# Create password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)
```

### 5. JWT Token Creation
```python
# app/security/jwt.py
from datetime import datetime, timedelta
from jose import jwt
from app.config import settings

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire, "type": "access"})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )
    
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    
    to_encode.update({"exp": expire, "type": "refresh"})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )
    
    return encoded_jwt
```

### 6. JWT Token Validation
```python
# app/security/jwt.py (continued)
from jose import JWTError, jwt
from fastapi import HTTPException, status

def verify_token(token: str, token_type: str = "access") -> dict:
    """Verify and decode a JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        
        # Verify token type
        if payload.get("type") != token_type:
            raise credentials_exception
        
        return payload
        
    except JWTError:
        raise credentials_exception
```

### 7. User Authentication Dependency
```python
# app/dependencies/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from app.database import get_session
from app.models.user import User
from app.security.jwt import verify_token

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    """Get current authenticated user from JWT token."""
    # Verify token
    payload = verify_token(token, token_type="access")
    
    # Get user ID from token
    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    # Get user from database
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user (additional check)."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user
```

### 8. User Model
```python
# app/models/user.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    full_name: str
    hashed_password: str
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    todos: List["Todo"] = Relationship(back_populates="owner")

class UserCreate(SQLModel):
    email: str = Field(regex=r"^[\w\.-]+@[\w\.-]+\.\w+$")
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=8)

class UserPublic(SQLModel):
    id: int
    email: str
    username: str
    full_name: str
    is_active: bool
    created_at: datetime

class UserLogin(SQLModel):
    email: str
    password: str

class Token(SQLModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(SQLModel):
    sub: int  # User ID
    exp: datetime
    type: str
```

### 9. Authentication Routes
```python
# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta
from app.database import get_session
from app.models.user import User, UserCreate, UserLogin, UserPublic, Token
from app.security.password import hash_password, verify_password
from app.security.jwt import create_access_token, create_refresh_token, verify_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserPublic, status_code=201)
def register(user_data: UserCreate, session: Session = Depends(get_session)):
    """Register a new user."""
    # Check if user already exists
    existing_user = session.exec(
        select(User).where(
            (User.email == user_data.email) | (User.username == user_data.username)
        )
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password)
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    """Login and get JWT tokens."""
    # Find user by email/username
    user = session.exec(
        select(User).where(
            (User.email == form_data.username) | (User.username == form_data.username)
        )
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, session: Session = Depends(get_session)):
    """Refresh access token using refresh token."""
    # Verify refresh token
    payload = verify_token(refresh_token, token_type="refresh")
    
    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user
    user = session.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user"
        )
    
    # Create new tokens
    new_access_token = create_access_token(data={"sub": user.id})
    new_refresh_token = create_refresh_token(data={"sub": user.id})
    
    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )

@router.get("/me", response_model=UserPublic)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user

@router.post("/logout")
def logout():
    """Logout (client should delete token)."""
    # In a stateless JWT system, logout is handled client-side
    # Server can implement token blacklist if needed
    return {"message": "Successfully logged out"}
```

### 10. Protected Routes
```python
# app/routers/todos.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.database import get_session
from app.models.todo import Todo, TodoCreate, TodoUpdate, TodoPublic
from app.models.user import User
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("/", response_model=List[TodoPublic])
def get_todos(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all todos for current user (protected)."""
    statement = select(Todo).where(
        Todo.user_id == current_user.id
    ).offset(skip).limit(limit)
    
    todos = session.exec(statement).all()
    return todos

@router.post("/", response_model=TodoPublic, status_code=201)
def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new todo (protected)."""
    todo = Todo.from_orm(todo_data, update={"user_id": current_user.id})
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo

@router.get("/{todo_id}", response_model=TodoPublic)
def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a specific todo (protected)."""
    statement = select(Todo).where(
        Todo.id == todo_id,
        Todo.user_id == current_user.id
    )
    todo = session.exec(statement).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    return todo

@router.put("/{todo_id}", response_model=TodoPublic)
def update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a todo (protected)."""
    todo = session.get(Todo, todo_id)
    
    if not todo or todo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    update_data = todo_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(todo, key, value)
    
    session.add(todo)
    session.commit()
    session.refresh(todo)
    return todo

@router.delete("/{todo_id}")
def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a todo (protected)."""
    todo = session.get(Todo, todo_id)
    
    if not todo or todo.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    session.delete(todo)
    session.commit()
    return {"message": "Todo deleted"}
```

## Examples

### Example 1: Complete Authentication System
```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, todos
from app.database import create_db_and_tables

app = FastAPI(title="Todo API with JWT Auth")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

# Include routers
app.include_router(auth.router)
app.include_router(todos.router)

@app.get("/")
def read_root():
    return {"message": "Todo API with JWT Authentication"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
```

### Example 2: Role-Based Access Control (RBAC)
```python
# app/dependencies/auth.py (extended)
from fastapi import Depends, HTTPException, status

def require_superuser(current_user: User = Depends(get_current_user)) -> User:
    """Require superuser role."""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return current_user

def require_role(required_role: str):
    """Require specific role."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required role: {required_role}"
            )
        return current_user
    return role_checker
```
```python
# Usage in routes
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(require_superuser),
    session: Session = Depends(get_session)
):
    """Delete user (admin only)."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    session.delete(user)
    session.commit()
    return {"message": "User deleted"}
```

### Example 3: Token Blacklist (Logout)
```python
# app/models/token_blacklist.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class TokenBlacklist(SQLModel, table=True):
    __tablename__ = "token_blacklist"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(unique=True, index=True)
    blacklisted_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
```
```python
# app/dependencies/auth.py (extended)
from app.models.token_blacklist import TokenBlacklist

def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
) -> User:
    """Get current user with blacklist check."""
    # Check if token is blacklisted
    blacklisted = session.exec(
        select(TokenBlacklist).where(TokenBlacklist.token == token)
    ).first()
    
    if blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked"
        )
    
    # Verify token and get user (rest of the code...)
    payload = verify_token(token, token_type="access")
    # ... rest of implementation
```
```python
# app/routers/auth.py (logout implementation)
@router.post("/logout")
def logout(
    token: str = Depends(oauth2_scheme),
    session: Session = Depends(get_session)
):
    """Logout by blacklisting token."""
    # Decode token to get expiry
    payload = verify_token(token)
    expires_at = datetime.fromtimestamp(payload["exp"])
    
    # Add to blacklist
    blacklist_entry = TokenBlacklist(
        token=token,
        expires_at=expires_at
    )
    session.add(blacklist_entry)
    session.commit()
    
    return {"message": "Successfully logged out"}
```

### Example 4: Email Verification
```python
# app/models/user.py (extended)
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    full_name: str
    hashed_password: str
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)  # Email verification
    verification_token: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
```
```python
# app/security/jwt.py (verification token)
def create_verification_token(email: str) -> str:
    """Create email verification token."""
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {"sub": email, "exp": expire, "type": "verification"}
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )
    
    return encoded_jwt
```
```python
# app/routers/auth.py (verification routes)
@router.post("/verify-email/{token}")
def verify_email(token: str, session: Session = Depends(get_session)):
    """Verify user email."""
    try:
        payload = verify_token(token, token_type="verification")
        email = payload.get("sub")
        
        user = session.exec(
            select(User).where(User.email == email)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.is_verified = True
        user.verification_token = None
        session.add(user)
        session.commit()
        
        return {"message": "Email verified successfully"}
        
    except HTTPException:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification token"
        )

@router.post("/resend-verification")
def resend_verification(
    email: str,
    session: Session = Depends(get_session)
):
    """Resend verification email."""
    user = session.exec(
        select(User).where(User.email == email)
    ).first()
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, verification link sent"}
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    # Generate new token
    verification_token = create_verification_token(user.email)
    user.verification_token = verification_token
    session.add(user)
    session.commit()
    
    # Send email (implement your email service)
    # send_verification_email(user.email, verification_token)
    
    return {"message": "Verification email sent"}
```

### Example 5: Password Reset
```python
# app/routers/auth.py (password reset)
from app.security.jwt import create_verification_token

@router.post("/forgot-password")
def forgot_password(email: str, session: Session = Depends(get_session)):
    """Request password reset."""
    user = session.exec(
        select(User).where(User.email == email)
    ).first()
    
    if not user:
        # Don't reveal if email exists
        return {"message": "If the email exists, reset link sent"}
    
    # Generate reset token
    reset_token = create_verification_token(user.email)
    
    # Send email with reset link
    # send_password_reset_email(user.email, reset_token)
    
    return {"message": "Password reset email sent"}

@router.post("/reset-password/{token}")
def reset_password(
    token: str,
    new_password: str = Field(min_length=8),
    session: Session = Depends(get_session)
):
    """Reset password with token."""
    try:
        payload = verify_token(token, token_type="verification")
        email = payload.get("sub")
        
        user = session.exec(
            select(User).where(User.email == email)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update password
        user.hashed_password = hash_password(new_password)
        session.add(user)
        session.commit()
        
        return {"message": "Password reset successfully"}
        
    except HTTPException:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )
```

### Example 6: Testing JWT Authentication
```python
# tests/test_auth.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    """Test user registration."""
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "testpassword123"
    })
    
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"
    assert "id" in data

def test_login():
    """Test user login."""
    # Register user first
    client.post("/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "testpassword123"
    })
    
    # Login
    response = client.post("/auth/login", data={
        "username": "test@example.com",
        "password": "testpassword123"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_protected_route():
    """Test accessing protected route."""
    # Register and login
    client.post("/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "testpassword123"
    })
    
    login_response = client.post("/auth/login", data={
        "username": "test@example.com",
        "password": "testpassword123"
    })
    
    token = login_response.json()["access_token"]
    
    # Access protected route
    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"

def test_invalid_token():
    """Test with invalid token."""
    response = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer invalid_token"}
    )
    
    assert response.status_code == 401
```

## Best Practices

### ✅ DO:

1. **Use strong secret keys**
```bash
   # Generate with openssl
   openssl rand -hex 32
```

2. **Set appropriate token expiration**
```python
   access_token_expire_minutes: int = 30  # Short-lived
   refresh_token_expire_days: int = 7     # Longer-lived
```

3. **Hash passwords with bcrypt**
```python
   hashed = hash_password(plain_password)
```

4. **Verify tokens on every request**
```python
   current_user: User = Depends(get_current_user)
```

5. **Store secret keys in environment variables**
```bash
   # .env
   SECRET_KEY=your-secret-key-here
```

6. **Use HTTPS in production**
```python
   # Only send tokens over HTTPS
   secure: bool = True
```

### ❌ DON'T:

1. **Don't store plain passwords**
```python
   # ❌ Bad
   user.password = plain_password
   
   # ✅ Good
   user.hashed_password = hash_password(plain_password)
```

2. **Don't use weak secret keys**
```python
   # ❌ Bad
   SECRET_KEY = "secret"
   
   # ✅ Good
   SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
```

3. **Don't expose token details in errors**
```python
   # ❌ Bad
   raise HTTPException(detail=f"Token expired at {exp}")
   
   # ✅ Good
   raise HTTPException(detail="Could not validate credentials")
```

4. **Don't set long access token expiration**
```python
   # ❌ Bad - 30 days
   access_token_expire_minutes: int = 43200
   
   # ✅ Good - 30 minutes
   access_token_expire_minutes: int = 30
```

5. **Don't skip token type validation**
```python
   # ✅ Always check token type
   if payload.get("type") != "access":
       raise HTTPException(status_code=401)
```

---

## Summary

JWT Token Authentication provides:
- 🔒 **Secure** - Cryptographically signed tokens
- 🚀 **Stateless** - No server-side sessions
- ⚡ **Scalable** - Works across multiple servers
- 📦 **Self-contained** - Includes user data
- ⏰ **Expirable** - Time-limited tokens
- 🔄 **Refreshable** - Refresh tokens for new access
- 🛡️ **Protected routes** - Easy to secure endpoints
- ✅ **Production ready** - Industry standard

Use JWT authentication for secure, scalable user authentication in your FastAPI applications.