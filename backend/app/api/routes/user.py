from sqlalchemy.exc import IntegrityError
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.comment import CommentPublic
from services.comment import get_comments_by_user
from models.post import PostPublic
from services.post import get_posts_by_user
from services.auth import get_current_user
from models.token import TokenData
from models.user import UserCreate, UserPublic, UserUpdate
from db.database import get_db
from services.user import create_user, delete_user, get_all_users, get_user_by_email, update_user

router = APIRouter()

@router.post("/user", response_model=UserPublic)
def create(body: UserCreate, db: Session = Depends(get_db)) -> UserPublic:
    try:
        return create_user(db, body)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="User already exists")

@router.put("/user/{user_id}", response_model=UserPublic)
def update(user_id: int, body: UserUpdate, current_user: TokenData = Depends(get_current_user), db:Session = Depends(get_db)) -> UserPublic:
    if user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    user = update_user(db, current_user.user_id, body)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/user/{user_id}")
def delete(user_id: int, current_user: TokenData = Depends(get_current_user), db:Session = Depends(get_db)):
    if user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    delete_user(db, current_user.user_id)
    return { "message": "User Deleted" }

@router.get("/user/{user_id}", response_model=UserPublic)
def get(user_id: int, current_user: TokenData = Depends(get_current_user), db:Session = Depends(get_db)) -> UserPublic:
    if user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return get_user_by_email(db, current_user.email)

@router.get("/users", response_model=UserPublic)
def get_all(user_id: int, current_user: TokenData = Depends(get_current_user), db:Session = Depends(get_db)) -> UserPublic:
    if user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return get_all_users(db)

@router.get("/user/{user_id}/posts", response_model=list[PostPublic])
def get(user_id: int, current_user: TokenData = Depends(get_current_user), db:Session = Depends(get_db)) -> list[PostPublic]:
    posts = get_posts_by_user(db, user_id)
    if user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return posts

@router.get("/user/{user_id}/comments", response_model=list[CommentPublic])
def get(user_id: int, current_user: TokenData = Depends(get_current_user), db:Session = Depends(get_db)) -> list[CommentPublic]:
    comments = get_comments_by_user(db, user_id)
    if user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return comments
