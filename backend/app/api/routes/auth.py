from services.profile import populate_profile
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from supabase_auth.errors import AuthApiError
from sqlalchemy.orm import Session
from core.supabase import supabase
from db.database import get_db
from models.token import Token
from pydantic import BaseModel
import re

USERNAME_RE = re.compile(r'^[A-Za-z0-9_-]{1,20}$')

router = APIRouter()

class SignUpBody(BaseModel):
    email: str
    password: str
    username: str

@router.post("/auth/signup", response_model=Token)
def signup(body: SignUpBody, db: Session = Depends(get_db)):
    if not USERNAME_RE.match(body.username):
        raise HTTPException(status_code=400, detail="Username must be 1–20 characters and contain only letters, numbers, underscores, or hyphens.")
    try:
        response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": { "data": { "username": body.username } },
        })
    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if response.session is None:
        raise HTTPException(status_code=400, detail="Email confirmation required — check your inbox.")
    populate_profile(id=response.user.id, username=body.username, db=db)
    return Token(access_token=response.session.access_token, token_type="bearer")

@router.post("/auth/login", response_model=Token)
def login(form: OAuth2PasswordRequestForm = Depends()):
    try:
        response = supabase.auth.sign_in_with_password({
            "email": form.username,  # OAuth2PasswordRequestForm uses `username` as the field convention
            "password": form.password
        })
    except AuthApiError:
        raise HTTPException(status_code=400, detail="Failed to login")
    return Token(access_token=response.session.access_token, token_type="bearer")
