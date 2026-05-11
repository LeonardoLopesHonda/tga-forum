from datetime import datetime
from sqlalchemy.exc import IntegrityError
from services.profile import get_user_by_id, get_user_by_username, populate_profile, update_profile
from models.user import UserPatch, UserPublic
from fastapi import APIRouter, Depends, HTTPException, Query
from services.comment import get_comments_by_user
from services.post import get_posts_by_user, list_user_posts_page
from services.auth import get_current_user
from models.comment import CommentPublic
from sqlalchemy.orm import Session
from models.token import TokenData
from models.post import Cursor, PostPage, PostPublic
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

@router.get("/users/me", response_model=UserPublic)
def get_me(current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)):
    user = get_user_by_id(current_user.user_id, db)
    if user is None:
        if not current_user.username:
            raise HTTPException(status_code=422, detail="username missing from user_metadata")
        try:
            populate_profile(current_user.user_id, current_user.username, db)
        except IntegrityError:
            raise HTTPException(status_code=409, detail="username taken")
        user = get_user_by_id(current_user.user_id, db)
    return {"user_id": user.id, "username": user.username, "bio": user.bio}

@router.get("/users/{username}", response_model=UserPublic)
def get_user_profile(username: str, db: Session = Depends(get_db)):
    user = get_user_by_username(username, db)
    return {"user_id": user.id, "username": user.username, "bio": user.bio}

@router.get("/users/{username}/posts", response_model=PostPage)
def get_user_profile_posts(
    username: str,
    limit: int = Query(10, ge=1, le=50),
    before: datetime | None = None,
    before_id: int | None = None,
    db: Session = Depends(get_db),
):
    user = get_user_by_username(username, db)
    rows = list_user_posts_page(db, user.id, limit, before, before_id)
    has_more = len(rows) > limit
    items = rows[:limit] if has_more else rows
    next_cursor = (
        Cursor(before=items[-1].created_at, before_id=items[-1].post_id)
        if has_more else None
    )
    return PostPage(items=items, next_cursor=next_cursor)

@router.patch("/users/{username}", response_model=UserPublic)
def update_user_profile(body: UserPatch, username: str, current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)):
    user = get_user_by_username(username, db)
    if current_user.user_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return update_profile(user, body, db)  # update_profile handles its own mapping