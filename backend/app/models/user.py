from uuid import UUID
from pydantic import BaseModel

class UserPublic(BaseModel):
    user_id: UUID
    email: str
