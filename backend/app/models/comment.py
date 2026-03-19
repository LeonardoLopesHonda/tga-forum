from pydantic import BaseModel, ConfigDict

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
    model_config = ConfigDict(from_attributes=True)