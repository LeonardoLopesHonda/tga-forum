from uuid import UUID
from pydantic import BaseModel

class ProfileBase(BaseModel):
    username: str

class ProfileCreate(ProfileBase):
    id: str

class ProfilePublic(ProfileBase):
    display_name: str
    avatar_url: str | None = None
    location: str | None = None
    links: list[str] = []
    bio: str | None = None
