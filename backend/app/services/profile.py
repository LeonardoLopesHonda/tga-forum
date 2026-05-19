from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from models.user import UserPatch
from db.database import Profile
from uuid import UUID

def populate_profile(id: str, username: str, db: Session):
    try:    
        profile = Profile(
            id=UUID(str(id)),
            username=username
        )
        db.add(profile)
        db.commit()
    except IntegrityError:
        db.rollback()
        existing = db.query(Profile).filter(Profile.id == UUID(str(id))).first()
        if existing is None:
            raise

def get_user_by_id(user_id: UUID, db: Session) -> Profile:
    user = db.query(Profile).filter(Profile.id == user_id).first()
    return user

def get_user_by_username(username: str, db: Session) -> Profile:
    user = db.query(Profile).filter(Profile.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def update_profile(user: Profile, body: UserPatch, db: Session):
    data = body.model_dump(exclude_unset=True)
    if "avatar_url" in data and data["avatar_url"] is not None:
        data["avatar_url"] = str(data["avatar_url"])
    for field, value in data.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return _serialize(user)

def _serialize(user: Profile) -> dict:
    return {
        "user_id": user.id,
        "username": user.username,
        "bio": user.bio,
        "display_name": user.display_name or user.username,
        "avatar_url": user.avatar_url,
        "location": user.location,
        "links": user.links,
    }