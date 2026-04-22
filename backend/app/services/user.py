from sqlalchemy.orm import Session
from models.user import UserUpdate
from db.database import User
from services.auth import hash_password

def get_all_users(db: Session):
    users = db.query(User).all()

    if not users:
        return []
    return users

def get_user_by_id(db: Session, user_id: int):
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        return None
    return user

def get_user_by_email(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None
    return user

def create_user(db: Session, body: User):
    user = User(
        email = body.email,
        username = body.username,
        password = hash_password(body.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        return None
    db.delete(user)
    db.commit()
    return

def update_user(db: Session, user_id: int, body: UserUpdate):
    db_user = db.query(User).filter(User.user_id == user_id).first()

    if not db_user:
        return None
    data = body.model_dump(exclude_unset=True)
    for field, value in data.items():
        if field == "password":
            value = hash_password(value)
        setattr(db_user, field, value)
    db.commit()
    db.refresh(db_user)
    return db_user
