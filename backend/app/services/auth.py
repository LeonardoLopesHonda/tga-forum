from uuid import UUID
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from core.config import settings
from models.token import TokenData

ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def verify_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=[ALGORITHM])
        user_id: UUID = UUID(payload.get("sub"))
        email: str = payload.get("email")
        return TokenData(user_id=user_id, email=email)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Token")

def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    return verify_token(token)