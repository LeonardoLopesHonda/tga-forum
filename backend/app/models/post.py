from pydantic import BaseModel, ConfigDict, model_validator
from typing import Any

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
    username: str
    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    @classmethod
    def extract_username(cls, obj: Any) -> Any:
        if hasattr(obj, 'user') and obj.user is not None:
            obj.__dict__['username'] = obj.user.username
        return obj