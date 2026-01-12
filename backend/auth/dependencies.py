from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.jwt import verify_token


security = HTTPBearer()


async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Dependency to get the current user ID from the Authorization header.
    Extracts token from Authorization header, verifies it, and returns user_id.
    """
    token = credentials.credentials
    print(f"DEBUG: Received token: {token[:50]}...")
    
    try:
        payload = verify_token(token)
        print(f"DEBUG: Token verified successfully. Payload: {payload}")
    except Exception as e:
        print(f"DEBUG: Token verification failed: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    print(f"DEBUG: User ID from token: {user_id}")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id