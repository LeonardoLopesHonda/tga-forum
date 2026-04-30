from services.profile import populate_profile
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from supabase_auth.errors import AuthApiError
from core.supabase import supabase
from models.token import Token
from pydantic import BaseModel

router = APIRouter()

class SignUpBody(BaseModel):
    email: str
    password: str
    username: str

@router.post("/auth/signup", response_model=Token)
def signup(body: SignUpBody):
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
    populate_profile(id=response.user.id, username=body.username)
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
