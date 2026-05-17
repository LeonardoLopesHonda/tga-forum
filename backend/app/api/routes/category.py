from services.category import get_all_categories
from models.category import CategoryPublic
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import Category, get_db

router = APIRouter()

@router.get("/categories", response_model=list[CategoryPublic])
def get_categories(db: Session = Depends(get_db)) -> list[CategoryPublic]:
    return get_all_categories(db)