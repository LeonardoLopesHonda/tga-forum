from sqlalchemy.orm import Session
from models.post import PostCreate, PostUpdate
from db.database import Post

def get_all_posts(db: Session):
    posts = db.query(Post).all()

    if not posts:
        return None
    return posts

def get_post_by_id(db: Session, post_id: int):
    post = db.query(Post).filter(Post.post_id == post_id).first()

    if not post:
        return None
    return post

def create_post(db: Session, body: PostCreate, user_id: int):
    post = Post(
        title = body.title,
        content = body.content,
        user_id = user_id
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

def delete_post(db: Session, post: Post):
    db.delete(post)
    db.commit()
    return

def update_post(db: Session, body: PostUpdate, post: Post):
    data = body.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post
