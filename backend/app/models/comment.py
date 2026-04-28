from pydantic import BaseModel, ConfigDict, model_validator
from typing import Any

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    parent_id: int | None = None

class CommentUpdate(BaseModel):
    content: str | None = None

class CommentPublic(CommentBase):
    comment_id: int
    parent_id: int | None = None
    post_id: int
    user_id: int
    username: str
    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    @classmethod
    def extract_username(cls, obj: Any) -> Any:
        if hasattr(obj, 'user') and obj.user is not None:
            obj.__dict__['username'] = obj.user.username
        return obj