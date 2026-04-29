import pytest
from uuid import UUID, uuid4
from datetime import datetime, timedelta, timezone
from jose import jwt
from fastapi import HTTPException
from services.auth import verify_token

SECRET = "test-secret-key-that-is-long-enough-for-hs256"
ALGORITHM = "HS256"

def make_token(payload: dict, secret: str = SECRET) -> str:
    return jwt.encode(payload, secret, algorithm=ALGORITHM)

def test_verify_token_extracts_user_id_and_email():
    user_id = uuid4()
    token = make_token({
        "sub": str(user_id),
        "email": "user@example.com",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    })
    # temporarily patch the secret
    import core.config as cfg
    original = cfg.settings.SUPABASE_JWT_SECRET
    cfg.settings.SUPABASE_JWT_SECRET = SECRET
    try:
        result = verify_token(token)
        assert result.user_id == user_id
        assert result.email == "user@example.com"
    finally:
        cfg.settings.SUPABASE_JWT_SECRET = original

def test_verify_token_raises_on_invalid_token():
    with pytest.raises(HTTPException) as exc_info:
        verify_token("not.a.valid.token")
    assert exc_info.value.status_code == 401

def test_verify_token_raises_on_wrong_secret():
    user_id = uuid4()
    token = make_token({
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }, secret="wrong-secret")
    import core.config as cfg
    cfg.settings.SUPABASE_JWT_SECRET = SECRET
    with pytest.raises(HTTPException) as exc_info:
        verify_token(token)
    assert exc_info.value.status_code == 401