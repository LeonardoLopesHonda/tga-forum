from sqlalchemy.orm import Session
from db.database import Category, get_db

def get_all_categories(db: Session):
    return db.query(Category).order_by(Category.category_id).all()