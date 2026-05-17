from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from models.token import TokenData
from services.auth import get_current_user
from db.database import get_db
from models.post import Cursor, PostCreate, PostPage, PostPublic, PostUpdate
from services.post import create_post, delete_post, get_post_by_id, list_posts_page, update_post

router = APIRouter()

@router.post("/posts", response_model=PostPublic)
def create(body: PostCreate, current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)) -> PostPublic:
    try: 
        return create_post(db, body, current_user.user_id)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Conflict")

@router.put("/posts/{post_id}", response_model=PostPublic)
def update(post_id: int, body: PostUpdate, current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)) -> PostPublic:
    post = get_post_by_id(db, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return update_post(db, body, post)

@router.delete("/posts/{post_id}")
def delete(post_id: int, current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)):
    post = get_post_by_id(db, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    delete_post(db, post)
    return { "message": "Post deleted" }

@router.get("/posts", response_model=PostPage)
def get_all(
    limit: int = Query(10, ge=1, le=50),
    before: datetime | None = None,
    before_id: int | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
) -> PostPage:
    rows = list_posts_page(db, limit, before, before_id, category)
    has_more = len(rows) > limit
    items = rows[:limit] if has_more else rows
    next_cursor = (
        Cursor(before=items[-1].created_at, before_id=items[-1].post_id)
        if has_more else None
    )
    return PostPage(items=items, next_cursor=next_cursor)

@router.get("/posts/{post_id}", response_model=PostPublic)
def get(post_id: int, db:Session = Depends(get_db)) -> PostPublic:
    post = get_post_by_id(db, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post