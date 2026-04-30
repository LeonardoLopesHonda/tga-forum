from uuid import UUID
from pydantic import BaseModel, ConfigDict

class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None

class PostPublic(PostBase):
    post_id: int
    user_id: UUID
    username: str
    model_config = ConfigDict(from_attributes=True)