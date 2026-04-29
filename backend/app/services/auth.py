from uuid import UUID
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError, jwk
from jose.utils import base64url_decode
from core.config import settings
from models.token import TokenData
import urllib.request
import json

ALGORITHM = "ES256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def _get_public_key():
    url = settings.SUPABASE_URL + "/auth/v1/.well-known/jwks.json"
    resp = urllib.request.urlopen(url)
    keys = json.load(resp)["keys"]
    return jwk.construct(keys[0])

def verify_token(token: str) -> TokenData:
    try:
        public_key = _get_public_key()
        payload = jwt.decode(token, public_key, algorithms=[ALGORITHM], audience="authenticated")
        user_id: UUID = UUID(payload["sub"])
        email: str = payload.get("email")
        return TokenData(user_id=user_id, email=email)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Token")

def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    return verify_token(token)
