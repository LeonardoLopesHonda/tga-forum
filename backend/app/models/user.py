from pydantic import BaseModel
from uuid import UUID

class UserPublic(BaseModel):
    user_id: UUID
    username: str
    bio: str | None = None

class UserPatch(BaseModel):
    bio: str | None = None