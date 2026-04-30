from sqlalchemy.orm import DeclarativeBase, Mapped, relationship, mapped_column, sessionmaker
from sqlalchemy import DateTime, ForeignKey, func, String
from sqlalchemy.dialects.postgresql import UUID
from core.config import settings
from sqlalchemy import create_engine
from typing import List
import datetime
import uuid

engine = create_engine(settings.DATABASE_URL, echo=True)
session = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

class Post(Base):
    __tablename__ = "post"

    post_id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    comments: Mapped[List["Comment"]] = relationship(back_populates="post")

class Comment(Base):
    __tablename__ = "comment"

    comment_id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    parent_id: Mapped[int | None] = mapped_column(ForeignKey("comment.comment_id"), nullable=True)
    children: Mapped[List["Comment"]] = relationship(back_populates="parent")
    parent: Mapped["Comment | None"] = relationship(back_populates="children", remote_side="Comment.comment_id")
    post_id: Mapped[int] = mapped_column(ForeignKey("post.post_id"))
    post: Mapped["Post"] = relationship(back_populates="comments")
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    username: Mapped[str] = mapped_column(String(20), nullable=False)

class PostWithUsername(Base):
    __tablename__ = "post_with_username"
    __table_args__ = {"extend_existing": True}

    post_id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    username: Mapped[str] = mapped_column(nullable=False)

class CommentWithUsername(Base):
    __tablename__ = "comment_with_username"
    __table_args__ = {"extend_existing": True}

    comment_id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True))
    parent_id: Mapped[int | None] = mapped_column(nullable=True)
    post_id: Mapped[int] = mapped_column(nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True))
    username: Mapped[str] = mapped_column(nullable=False)

def create_tables():
    Base.metadata.create_all(engine)

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()
