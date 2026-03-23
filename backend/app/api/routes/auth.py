from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from models.token import Token
from services.user import get_user_by_email
from db.database import get_db
from services.auth import sign_token, verify_password

router = APIRouter()

@router.post("/auth", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_email(db, form.username) # OAuth2PasswordRequestForm uses `username` as the field convention
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(form.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = sign_token({ "user_id": user.user_id, "email": user.email })
    return Token(access_token=token, token_type="bearer")