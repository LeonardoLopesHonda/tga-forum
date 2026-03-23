from datetime import datetime, timedelta
from fastapi import Depends, HTTPException
from models.token import TokenData
from core.config import settings
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import jwt, JWTError

PEPPER = settings.PEPPER
SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth")
pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto", bcrypt_sha256__default_rounds=12)

def hash_password(password: str) -> str:
    return pwd_context.hash(password + PEPPER)

def verify_password(plain: str, hashed: str) -> bool:
    password = plain + PEPPER
    return pwd_context.verify(password, hashed)

def sign_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now() + timedelta(hours=24)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> TokenData:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        email: str = payload.get("email")
        return TokenData(user_id=user_id, email=email)
    except TypeError:
        raise HTTPException(status_code=404, detail="User Not Found")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Token")

def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    return verify_token(token)