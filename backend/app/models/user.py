from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Annotated
from uuid import UUID

LinkStr = Annotated[str, Field(max_length=500)]

class UserPublic(BaseModel):
    user_id: UUID
    username: str
    bio: str | None = None
    display_name: str
    avatar_url: str | None = None
    location: str | None = None
    links: list[str] = []

class UserPatch(BaseModel):
    bio: str | None = Field(default=None, max_length=160)
    display_name: str | None = Field(default=None, min_length=1, max_length=50)
    avatar_url: HttpUrl | None = None
    location: str | None = Field(default=None, max_length=100)
    links: list[LinkStr] | None = Field(default=None, max_length=3)

    @field_validator("bio", "display_name", "avatar_url", "location", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        return None if v == "" else v

    @field_validator("avatar_url")
    @classmethod
    def must_be_bucket_url(cls, v):
        if v is None:
            return v
        from core.config import settings
        prefix = f"{settings.SUPABASE_URL}/storage/v1/object/public/avatars/"
        if not str(v).startswith(prefix):
            raise ValueError("avatar_url must point to the avatars bucket")
        return v