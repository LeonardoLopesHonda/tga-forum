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
    user_id: int
    post_id: int
    model_config = ConfigDict(from_attributes=True)