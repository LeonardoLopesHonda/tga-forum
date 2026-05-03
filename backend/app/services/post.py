from uuid import UUID
from sqlalchemy.orm import Session
from models.post import PostCreate, PostUpdate
from db.database import Post, PostWithUsername

def get_all_posts(db: Session):
    posts = db.query(PostWithUsername).all()
    if not posts:
        return []
    return posts

def get_post_by_id(db: Session, post_id: int):
    post = db.query(PostWithUsername).filter(PostWithUsername.post_id == post_id).first()
    if not post:
        return None
    return post

def get_posts_by_user(db: Session, user_id: UUID):
    posts = db.query(PostWithUsername).filter(PostWithUsername.user_id == user_id).all()
    if not posts:
        return []
    return posts

def get_recent_posts_by_user(db: Session, user_id: UUID):
    posts = db.query(PostWithUsername).filter(PostWithUsername.user_id == user_id).order_by(PostWithUsername.created_at.desc()).all()
    if not posts:
        return []
    return posts

def create_post(db: Session, body: PostCreate, user_id: UUID):
    post = Post(
        title=body.title,
        content=body.content,
        user_id=user_id
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return db.query(PostWithUsername).filter(PostWithUsername.post_id == post.post_id).first()

def delete_post(db: Session, post: Post):
    db.delete(post)
    db.commit()

def update_post(db: Session, body: PostUpdate, post: Post):
    data = body.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post
