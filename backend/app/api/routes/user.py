from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.comment import CommentPublic
from services.comment import get_comments_by_user
from models.post import PostPublic
from services.post import get_posts_by_user
from services.auth import get_current_user
from models.token import TokenData
from db.database import get_db

router = APIRouter()

@router.get("/user/{user_id}/posts", response_model=list[PostPublic])
def get_user_posts(user_id: str, current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)):
    if str(current_user.user_id) != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return get_posts_by_user(db, current_user.user_id)

@router.get("/user/{user_id}/comments", response_model=list[CommentPublic])
def get_user_comments(user_id: str, current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)):
    if str(current_user.user_id) != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return get_comments_by_user(db, current_user.user_id)
