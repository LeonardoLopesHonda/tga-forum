from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    PEPPER: str

    model_config = { "env_file": Path(__file__).resolve().parent.parent.parent / ".env" }

settings = Settings()