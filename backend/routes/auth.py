# auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime, timedelta
import os
import jwt
import logging
from passlib.context import CryptContext

from db import get_session
from models.user import User
from schemas.user import UserCreate, UserLogin, Token

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ---------------------------
# Logging
# ---------------------------
logging.basicConfig(level=logging.INFO)

# ---------------------------
# JWT settings
# ---------------------------
JWT_SECRET = os.getenv("JWT_SECRET", "your_super_secret_key")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# ---------------------------
# JWT token utility
# ---------------------------
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

# ---------------------------
# Signup endpoint
# ---------------------------
@router.post("/signup", response_model=Token)
async def signup(user_create: UserCreate, session: Session = Depends(get_session)) -> Token:
    try:
        logging.info(f"Signup attempt for email: {user_create.email}")

        # Normalize email
        normalized_email = user_create.email.lower().strip()

        # Check if user already exists
        statement = select(User).where(User.email == normalized_email)
        existing_user = session.exec(statement).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Hash the password
        hashed_password = pwd_context.hash(user_create.password)

        user = User(
            email=normalized_email,
            password_hash=hashed_password,
            is_active=True
        )

        session.add(user)
        session.commit()
        session.refresh(user)

        logging.info(f"User created successfully: {user.id}")

        # Create access token
        access_token = create_access_token(data={"sub": str(user.id)})
        return Token(access_token=access_token, token_type="bearer")

    except HTTPException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        logging.error(f"Signup failed: {str(e)}", exc_info=True)
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup error: {str(e)}"
        )

# ---------------------------
# Logout endpoint
# ---------------------------
@router.post("/logout")
async def logout():
    """
    Logout endpoint - JWT tokens are stateless, so we just return success.
    The client is responsible for deleting the token from localStorage.
    """
    return {"message": "Successfully logged out"}

# ---------------------------
# Refresh token endpoint
# ---------------------------
@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_token: str = Depends(lambda: None),
    session: Session = Depends(get_session)
) -> Token:
    """
    Refresh an existing token - generates a new token for the same user.
    In a real app, you'd validate the old token first.
    """
    try:
        # You can decode and validate the existing token here if needed
        # For now, this is a simple implementation
        
        # Decode the token from the Authorization header (implement if needed)
        # For simplicity, we're skipping validation
        
        # Generate new token
        # In real implementation, extract user_id from old token
        # access_token = create_access_token(data={"sub": user_id})
        
        return {"message": "Token refresh not fully implemented yet"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# ---------------------------
# Signin endpoint
# ---------------------------
@router.post("/signin", response_model=Token)
async def signin(user_login: UserLogin, session: Session = Depends(get_session)) -> Token:
    try:
        logging.info(f"Signin attempt for email: {user_login.email}")

        # Normalize email
        normalized_email = user_login.email.lower().strip()

        # Find user by email
        statement = select(User).where(User.email == normalized_email)
        user = session.exec(statement).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Verify password using bcrypt
        if not pwd_context.verify(user_login.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Inactive user",
                headers={"WWW-Authenticate": "Bearer"},
            )

        logging.info(f"User signed in successfully: {user.id}")

        access_token = create_access_token(data={"sub": str(user.id)})
        return Token(access_token=access_token, token_type="bearer")

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Signin failed: {str(e)}", exc_info=True)
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signin error: {str(e)}"
        )