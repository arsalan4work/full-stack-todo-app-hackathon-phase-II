from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from jose import JWTError, jwt
import os
from pydantic import BaseModel


def get_secret_key():
    """Get the secret key from environment variable, with a default for testing"""
    # Try JWT_SECRET first, then SECRET_KEY, then fallback to test key
    return os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY", "test-secret-key-for-testing")


def get_algorithm():
    """Get the algorithm from environment variable, with a default for testing"""
    # Try JWT_ALGORITHM first, then ALGORITHM, then fallback
    return os.getenv("JWT_ALGORITHM") or os.getenv("ALGORITHM", "HS256")


def get_access_token_expire_minutes():
    """Get the access token expiration time from environment variable, with a default for testing"""
    # Try ACCESS_TOKEN_EXPIRE_MINUTES first
    expire_minutes = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
    if expire_minutes:
        return int(expire_minutes)
    return 30


class TokenData(BaseModel):
    user_id: str


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a new access token with the provided data"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    encoded_jwt = jwt.encode(to_encode, get_secret_key(), algorithm=get_algorithm())
    return encoded_jwt


def verify_token(token: str) -> dict:
    """
    Verify a JWT token and return the payload.
    Raises HTTPException if token is invalid or expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=[get_algorithm()])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError as e:
        print(f"JWT Error: {e}")  # Debug logging
        raise credentials_exception
    return payload


def get_current_user(token: str) -> str:
    """
    Get the current user from the token.
    Returns the user_id extracted from the token.
    """
    payload = verify_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id