from uuid import UUID
from pydantic import BaseModel, ConfigDict

class ProfileBase(BaseModel):
    username: str

class ProfileCreate(ProfileBase):
    id: str

class ProfilePublic(ProfileBase):
    pass