from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.user import UserPatch
from services.post import get_recent_posts_by_user
from db.database import Profile
from uuid import UUID

def populate_profile(id: str, username: str, db: Session):
    profile = Profile(
        id=UUID(str(id)),
        username=username
    )
    db.add(profile)
    db.commit()

def get_user_by_username(username: str, db: Session):
    user = db.query(Profile).filter(Profile.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_user_profile_with_posts(username: str, db: Session):
    user = get_user_by_username(username, db)
    posts = get_recent_posts_by_user(db, user.id)
    return {
        "user_id": user.id,
        "username": user.username,
        "bio": user.bio,
        "posts": posts
    }

def update_profile(user: Profile, body: UserPatch, db: Session):
    data = body.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return {"user_id": user.id, "username": user.username, "bio": user.bio}
