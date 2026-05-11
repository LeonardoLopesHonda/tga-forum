from typing import Literal
from uuid import UUID
from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: UUID
    username: str | None = None
    email: str | None = None

class PendingConfirmation(BaseModel):
    pending_confirmation: Literal[True] = True