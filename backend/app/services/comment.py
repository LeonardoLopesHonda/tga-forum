from uuid import UUID
from sqlalchemy.orm import Session
from models.comment import CommentCreate, CommentUpdate
from db.database import Comment

def get_comments_by_post(db: Session, post_id: int):
    comments = db.query(Comment).filter(Comment.post_id == post_id).all()
    if not comments:
        return []
    return comments

def get_comment_by_id(db: Session, comment_id: int):
    comment = db.query(Comment).filter(Comment.comment_id == comment_id).first()
    if not comment:
        return None
    return comment

def get_comments_by_user(db: Session, user_id: UUID):
    comments = db.query(Comment).filter(Comment.user_id == user_id).all()
    if not comments:
        return []
    return comments

def create_comment(db: Session, body: CommentCreate, post_id: int, user_id: UUID, parent_id: int | None = None):
    comment = Comment(
        content=body.content,
        parent_id=parent_id,
        post_id=post_id,
        user_id=user_id
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

def delete_comment(db: Session, comment: Comment):
    db.delete(comment)
    db.commit()

def update_comment(db: Session, body: CommentUpdate, comment: Comment):
    data = body.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(comment, field, value)
    db.commit()
    db.refresh(comment)
    return comment

def list_comment_ancestors(db: Session, comment: Comment) -> list[Comment]:
    ancestors_rev: list[Comment] = []
    seen: set[int] = set()
    pid = comment.parent_id
    while pid is not None:
        if pid in seen:
            break
        seen.add(pid)
        parent = get_comment_by_id(db, pid)
        if parent is None:
            break
        ancestors_rev.append(parent)
        pid = parent.parent_id
    ancestors_rev.reverse()
    return ancestors_rev
