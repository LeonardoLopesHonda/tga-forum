from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from models.token import TokenData
from services.auth import get_current_user
from db.database import get_db
from models.comment import CommentPublic, CommentCreate, CommentUpdate
from services.comment import create_comment, delete_comment, get_comments_by_post, get_comment_by_id, update_comment, list_comment_ancestors

router = APIRouter()

@router.post("/posts/{post_id}/comments", response_model=CommentPublic)
def create(post_id: int, body: CommentCreate, current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)) -> CommentPublic:
    try: 
        return create_comment(db, body, post_id, current_user.user_id)
    except IntegrityError:
        raise HTTPException(status_code=404, detail="Post/User not found")

@router.post("/comments/{parentComment_id}/replies", response_model=CommentPublic)
def reply(parentComment_id: int, body: CommentCreate, current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)) -> CommentPublic:
    comment = get_comment_by_id(db, parentComment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    try: 
        return create_comment(db, body, comment.post_id, current_user.user_id, comment.comment_id)
    except IntegrityError:
        raise HTTPException(status_code=404, detail="Post/User not found")

@router.put("/comments/{comment_id}", response_model=CommentPublic)
def update(comment_id: int, body: CommentUpdate, current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)) -> CommentPublic:
    comment = get_comment_by_id(db, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return update_comment(db, body, comment)

@router.delete("/comments/{comment_id}")
def delete(comment_id: int, current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)):
    comment = get_comment_by_id(db, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    delete_comment(db, comment)
    return { "message": "Comment deleted" }

@router.get("/posts/{post_id}/comments", response_model=list[CommentPublic])
def get(post_id: int, db:Session = Depends(get_db)) -> list[CommentPublic]:
    comments = get_comments_by_post(db, post_id)
    if comments is None:
        raise HTTPException(status_code=404, detail="Comments not found")
    return comments

@router.get("/comments/{comment_id}/ancestors", response_model=list[CommentPublic])
def get_ancestors(comment_id: int, db: Session = Depends(get_db)) -> list[CommentPublic]:
    comment = get_comment_by_id(db, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return list_comment_ancestors(db, comment)

@router.get("/comments/{comment_id}/breadcrumb", response_model=list[CommentPublic])
def get_breadcrumb(comment_id: int, db: Session = Depends(get_db)) -> list[CommentPublic]:
    comment = get_comment_by_id(db, comment_id)
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    return [*list_comment_ancestors(db, comment), comment]