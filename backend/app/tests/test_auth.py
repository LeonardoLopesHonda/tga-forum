import pytest
from uuid import uuid4
from unittest.mock import patch
from datetime import datetime, timedelta, timezone
from jose import jwt, jwk
from fastapi import HTTPException
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend
from services.auth import verify_token

ALGORITHM = "ES256"

# Generate ES256 keypair for testing
_private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
_public_key = _private_key.public_key()

def make_es256_key():
    return jwk.construct(_public_key, algorithm=ALGORITHM)

def make_token(payload: dict) -> str:
    return jwt.encode(payload, _private_key, algorithm=ALGORITHM)

@patch("services.auth._get_public_key")
def test_verify_token_extracts_user_id_and_email(mock_key):
    mock_key.return_value = make_es256_key()
    user_id = uuid4()
    token = make_token({
        "sub": str(user_id),
        "email": "user@example.com",
        "aud": "authenticated",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    })
    result = verify_token(token)
    assert result.user_id == user_id
    assert result.email == "user@example.com"

@patch("services.auth._get_public_key")
def test_verify_token_raises_on_invalid_token(mock_key):
    mock_key.return_value = make_es256_key()
    with pytest.raises(HTTPException) as exc_info:
        verify_token("not.a.valid.token")
    assert exc_info.value.status_code == 401

@patch("services.auth._get_public_key")
def test_verify_token_raises_on_wrong_secret(mock_key):
    mock_key.return_value = make_es256_key()
    user_id = uuid4()
    # Create a token with a different keypair to simulate wrong signature
    wrong_private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
    wrong_token = jwt.encode({
        "sub": str(user_id),
        "aud": "authenticated",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }, wrong_private_key, algorithm=ALGORITHM)
    with pytest.raises(HTTPException) as exc_info:
        verify_token(wrong_token)
    assert exc_info.value.status_code == 401