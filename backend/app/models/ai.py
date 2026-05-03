from pydantic import BaseModel, model_validator
from typing import Self

class AiBase(BaseModel):
    title: str | None = None
    content: str | None = None

class AiCreate(AiBase):
    pass
    @model_validator(mode='after')
    def at_least_one_field(self) -> Self:
        if self.title is None and self.content is None:
            raise ValueError('At least one field (title or content) must be provided')
        return self

class AiPostAssistResponse(AiBase):
    pass