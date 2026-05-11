from fastapi.security import OAuth2PasswordRequestForm
from fastapi import APIRouter, Depends, HTTPException
from models.token import PendingConfirmation, Token
from services.profile import populate_profile
from supabase_auth.errors import AuthApiError
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from core.supabase import supabase
from urllib.parse import urlparse
from core.config import settings
from db.database import get_db
from pydantic import BaseModel
import re

USERNAME_RE = re.compile(r'^[A-Za-z0-9_-]{1,20}$')

router = APIRouter()

class SignUpBody(BaseModel):
    email: str
    password: str
    username: str
    email_redirect_to: str | None = None

def _validate_redirect(url: str | None) -> str | None:
    if url is None:
        return None
    target = urlparse(url)
    target_origin = f"{target.scheme}://{target.netloc}"
    allowed = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")]
    if target_origin not in allowed:
        raise HTTPException(status_code=400, detail="Invalid redirect URL")
    return url

@router.post("/auth/signup", response_model=Token, responses={202: {"model": PendingConfirmation}})
def signup(body: SignUpBody, db: Session = Depends(get_db)):
    if not USERNAME_RE.match(body.username):
        raise HTTPException(status_code=400, detail="Username must be 1–20 characters and contain only letters, numbers, underscores, or hyphens.")
    redirect = _validate_redirect(body.email_redirect_to)
    try:
        options = {"data": {"username": body.username}}
        if redirect:
            options["email_redirect_to"] = redirect
        response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": options,
        })
    except AuthApiError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if response.session is None:
        return JSONResponse(status_code=202, content=PendingConfirmation().model_dump())
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
