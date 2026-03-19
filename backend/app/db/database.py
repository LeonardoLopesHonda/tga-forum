from sqlalchemy.orm import DeclarativeBase, Mapped, relationship, mapped_column, sessionmaker
from sqlalchemy import ForeignKey
from sqlalchemy import create_engine
from typing import List

engine = create_engine("postgresql+psycopg2://postgres:postgres123@localhost:5432/tga-forum", echo=True)
session = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "user"

    user_id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(nullable=False)
    email: Mapped[str] = mapped_column(nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)

    posts: Mapped[List["Post"]] = relationship(back_populates="user")
    comments: Mapped[List["Comment"]] = relationship(back_populates="user")

class Post(Base):
    __tablename__ = "post"

    post_id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(nullable=False)

    user_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"))
    user: Mapped["User"] = relationship(back_populates="posts")
    comments: Mapped[List["Comment"]] = relationship(back_populates="post")

class Comment(Base):
    __tablename__ = "comment"

    comment_id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(nullable=False)

    parent_id: Mapped[int | None] = mapped_column(ForeignKey("comment.comment_id"), nullable=True)
    children: Mapped[List["Comment"]] = relationship(back_populates="parent")
    parent: Mapped["Comment" | None] = relationship(back_populates="children", remote_side="[comment_id]")
    post_id: Mapped[int] = mapped_column(ForeignKey("post.post_id"))
    post: Mapped["Post"] = relationship(back_populates="comments")
    user_id: Mapped[int] = mapped_column(ForeignKey("user.user_id"))
    user: Mapped["User"] = relationship(back_populates="comments")

def create_tables():
    Base.metadata.create_all(engine)

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()
