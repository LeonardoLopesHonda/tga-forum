from fastapi import FastAPI, Header
from pydantic import BaseModel
from sqlmodel import Field, Session, SQLModel, create_engine, select

class User(BaseModel):
    username: str | None = None
    email: str

app = FastAPI()

# AUTH
@app.post("/auth")
def create_session(user: User, password: str):
    return {"access_token": "mock_token_123"}

# USERS
@app.post("/users")
def create_user(user: User, password: str):
    # TODO: Generate user_id after sending req to db
    return { 
        "user_id": 1,
        **user.model_dump()
    }

@app.put("/users/{user_id}")
def update_user(user: User, user_id: int, password: str, access_token: str = Header()):
    return { 
        **user.model_dump()
    }

@app.delete("/users/{user_id}")
def delete_user(access_token: str = Header()):
    return {"message": "User deleted"}

@app.get("/users")
def get_users(access_token: str = Header()):
    return [
        {
            "username": "user1",
            "email": "user1.mail@gmail.com",
        }, {
            "username": "user2",
            "email": "user2.mail@gmail.com",
        }
    ]

@app.get("/users/{user_id}")
def get_user(access_token: str = Header()):
    return {
        "username": "user1",
        "email": "user1.mail@gmail.com",
    }

@app.get("/users/{user_id}/posts")
def get_user_posts(access_token: str = Header()):
    return {
        "username": "user1",
        "posts": [
            "post1",
            "post2"
        ],
    }

@app.get("/users/{user_id}/comments")
def get_user_comments(access_token: str = Header()):
    return {
        "username": "user1",
        "comments": [
            "comment1",
            "comment2"
        ],
    }

# POSTS
@app.post("/posts")
def create_post(title: str, content: str, access_token: str = Header()):
    return { 
        "post_id": 1,
        "user_id": 1,
        "title": "Post's title",
        "content": "Post's content",
    }

@app.put("/posts/{post_id}")
def update_post(title: str, content: str, access_token: str = Header()):
    return { 
        "post_id": 1,
        "user_id": 1,
        "title": "Post's title",
        "content": "Post's content",
    }

@app.delete("/posts/{post_id}")
def delete_post(post_id: int, access_token: str = Header()):
    return {"message": "Post deleted"}

@app.get("/posts")
def get_posts(access_token: str = Header()):
    return [
        {
            "user_id": 1,
            "post_id": "post1",
            "title": "Post1 title",
            "content": "Post1 content",
        }, {
            "user_id": 2,
            "post_id": "post2",
            "title": "Post2 title",
            "content": "Post2 content",
        }
    ]

@app.get("/posts/{post_id}")
def get_post(access_token: str = Header()):
    return {
        "user_id": 2,
        "post_id": "post2",
        "title": "Post2 title",
        "content": "Post2 content",
    }

# Comments
@app.post("/posts/{post_id}/comments")
def create_comment(post_id: int, content: str, parent_id: int | None = None, access_token: str = Header()):
    return { 
        "comment_id": 1,
        "parent_id": None,
        "post_id": 1,
        "user_id": 1,
        "content": "Comments's content",
    }

@app.post("/posts/replies/{parentComment_id}")
def create_reply(parent_id: int, post_id: int, user_id: int, title: str, content: str, access_token: str = Header()):
    return { 
        "comment_id": 2,
        "parent_id": 1,
        "post_id": 1,
        "user_id": 1,
        "content": "Reply's content",
    }

@app.put("/posts/comments/{comment_id}")
def update_comment(comment_id: int, title: str, content: str, access_token: str = Header()):
    return { 
        "comment_id": 1,
        "parent_id": None,
        "post_id": 1,
        "user_id": 1,
        "content": "Reply's content",
    }

@app.delete("/posts/comments/{comment_id}")
def delete_comment(comment_id: int, access_token: str = Header()):
    return {"message": "Comment deleted"}

@app.get("/posts/{post_id}/comments")
def get_comments(post_id: int, access_token: str = Header()):
    return [ 
        {
            "comment_id": 1,
            "parent_id": None,
            "post_id": 1,
            "user_id": 1,
            "content": "Comments's content",
        },
        {
            "comment_id": 2,
            "parent_id": 1,
            "post_id": 1,
            "user_id": 1,
            "content": "Reply's content",
        },
    ]

@app.get("/posts/comments/{comment_id}")
def get_comment(comment_id: int, access_token: str = Header()):
    return { 
        "comment_id": 1,
        "parent_id": None,
        "post_id": 1,
        "user_id": 1,
        "content": "Comments's content",
    }

@app.get("/posts/comments/{comment_id}/ancestors")
def get_comment_ancestors(comment_id: int, access_token: str = Header()):
    return [ 
        {
            "comment_id": 1,
            "parent_id": None,
            "post_id": 1,
            "user_id": 1,
            "content": "Comments's content",
        }
    ]

@app.get("/posts/comments/{comment_id}/breadcrumb")
def get_comment_breadcrumb(comment_id: int, access_token: str = Header()):
    return [ 
        {
            "comment_id": 2,
            "parent_id": 1,
            "post_id": 1,
            "user_id": 1,
            "content": "Reply's content",
        },
    ]