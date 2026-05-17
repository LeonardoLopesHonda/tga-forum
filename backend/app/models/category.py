from pydantic import BaseModel, ConfigDict

class CategoryBase(BaseModel):
    pass

class CategoryPublic(CategoryBase):
    category_id: int
    slug: str
    name: str
    color_from: str
    color_to: str

    model_config = ConfigDict(from_attributes=True)
