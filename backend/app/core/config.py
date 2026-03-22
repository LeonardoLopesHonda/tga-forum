from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    JWT_SECRET_KEY: str
    DATABASE_URL: str

    model_config = { "env_file": Path(__file__).resolve().parent.parent.parent / ".env" }

settings = Settings()