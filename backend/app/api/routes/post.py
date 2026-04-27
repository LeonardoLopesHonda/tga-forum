from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from models.token import TokenData
from services.auth import get_current_user
from db.database import get_db
from models.post import PostPublic, PostCreate, PostUpdate
from services.post import create_post, delete_post, get_all_posts, get_post_by_id, update_post

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

@router.get("/posts", response_model=list[PostPublic])
def get_all(db:Session = Depends(get_db)) -> list[PostPublic]:
    return get_all_posts(db)

@router.get("/posts/{post_id}", response_model=PostPublic)
def get(post_id: int, db:Session = Depends(get_db)) -> PostPublic:
    post = get_post_by_id(db, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return post