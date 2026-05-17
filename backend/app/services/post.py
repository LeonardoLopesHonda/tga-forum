from datetime import datetime
from uuid import UUID
from sqlalchemy import tuple_
from sqlalchemy.orm import Session
from models.post import PostCreate, PostUpdate
from db.database import Category, Post, PostWithUsername

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

def create_post(db: Session, body: PostCreate, user_id: UUID):
    post = Post(
        title=body.title,
        content=body.content,
        user_id=user_id,
        category_id=body.category_id,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    post = db.query(PostWithUsername).filter(PostWithUsername.post_id == post.post_id).first()
    return post

def delete_post(db: Session, post: Post):
    db.delete(post)
    db.commit()

def update_post(db: Session, body: PostUpdate, post):
    data = body.model_dump(exclude_unset=True)
    if data:
        db.query(Post).filter(Post.post_id == post.post_id).update(data)
        db.commit()
    return db.query(PostWithUsername).filter(PostWithUsername.post_id == post.post_id).first()

def _apply_cursor(query, before: datetime | None, before_id: int | None):
    if before is not None and before_id is not None:
        query = query.filter(
            tuple_(PostWithUsername.created_at, PostWithUsername.post_id) <
            tuple_(before, before_id)
        )
    return query.order_by(
        PostWithUsername.created_at.desc(),
        PostWithUsername.post_id.desc(),
    )

def list_posts_page(db: Session, limit: int, before: datetime | None, before_id: int | None, category: str | None = None):
    query = db.query(PostWithUsername)
    if category is not None:
        cat = db.query(Category).filter(Category.slug == category).first()
        if cat is None:
            return []
        query = query.filter(PostWithUsername.category_id == cat.category_id)
    query = _apply_cursor(query, before, before_id)
    return query.limit(limit + 1).all()

def list_user_posts_page(db: Session, user_id: UUID, limit: int, before: datetime | None, before_id: int | None):
    query = db.query(PostWithUsername).filter(PostWithUsername.user_id == user_id)
    query = _apply_cursor(query, before, before_id)
    return query.limit(limit + 1).all()
