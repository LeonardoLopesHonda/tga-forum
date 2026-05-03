from services.profile import get_user_by_username, get_user_profile_with_posts, update_profile
from fastapi import APIRouter, Depends, HTTPException
from services.comment import get_comments_by_user
from models.user import UserPatch, UserProfile, UserPublic
from services.post import get_posts_by_user
from services.auth import get_current_user
from models.comment import CommentPublic
from sqlalchemy.orm import Session
from models.token import TokenData
from models.post import PostPublic
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

@router.get("/users/{username}", response_model=UserProfile)
def get_user_profile(username: str, db: Session = Depends(get_db)):
    return get_user_profile_with_posts(username, db)

@router.patch("/users/{username}", response_model=UserPublic)
def update_user_profile(body: UserPatch, username: str, current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)):
    user = get_user_by_username(username, db)
    if current_user.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return update_profile(user, body, db)