from fastapi import FastAPI # type: ignore

app = FastAPI()

# AUTH
@app.post("/auth")
def create_session(email: str, password: str):
    return {"access_token": "mock_token_123"}

# USERS
@app.post("/users")
def create_user(username: str, email: str, password: str):
    return { 
        "user_id": 1,
        "username": "user1",
        "email": "user1.mail@gmail.com",
    }

@app.put("/users/{user_id}")
def update_user(access_token: str, username: str, email: str, password: str):
    return { 
        "user_id": 1,
        "username": "user1",
        "email": "user1.mail@gmail.com",
    }

@app.delete("/users/{user_id}")
def delete_user(access_token: str):
    return {"message": "User deleted"}

@app.get("/users")
def get_users(access_token: str):
    return {[
        {
            "username": "user1",
            "email": "user1.mail@gmail.com",
        }, {
            "username": "user2",
            "email": "user2.mail@gmail.com",
        }
    ]}

@app.get("/users/{user_id}")
def get_user(access_token: str):
    return {
        "username": "user1",
        "email": "user1.mail@gmail.com",
    }

@app.get("/users/{user_id}/posts")
def get_user(access_token: str):
    return {
        "username": "user1",
        "posts": [
            "post1",
            "post2"
        ],
    }

@app.get("/users/{user_id}/comments")
def get_user(access_token: str):
    return {
        "username": "user1",
        "comments": [
            "comment1",
            "comment2"
        ],
    }

# POSTS
@app.post("/posts")
def create_post(access_token: str, title: str, content: str):
    return { 
        "post_id": 1,
        "user_id": 1,
        "title": "Post's title",
        "content": "Post's content",
    }

@app.put("/posts/{post_id}")
def update_post(access_token: str, title: str, content: str):
    return { 
        "post_id": 1,
        "user_id": 1,
        "title": "Post's title",
        "content": "Post's content",
    }

@app.delete("/posts/{post_id}")
def delete_post(access_token: str, post_id: id):
    return {"message": "Post deleted"}

@app.get("/posts")
def get_posts(access_token: str):
    return {[
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
    ]}

@app.get("/posts/{post_id}")
def get_post(access_token: str):
    return {
        "user_id": 2,
        "post_id": "post2",
        "title": "Post2 title",
        "content": "Post2 content",
    }

# Comments
@app.post("/posts/comments/{post_id}")
def create_comment(access_token: str, post_id: int, content: str, parent_id: int | None = None):
    return { 
        "comment_id": 1,
        "parent_id": None,
        "post_id": 1,
        "user_id": 1,
        "content": "Comments's content",
    }

@app.post("/posts/replies/{parentComment_id}")
def create_reply(access_token: str, parent_id: int, post_id: int, user_id: int, title: str, content: str):
    return { 
        "comment_id": 2,
        "parent_id": 1,
        "post_id": 1,
        "user_id": 1,
        "content": "Reply's content",
    }

@app.put("/posts/comments/{comment_id}")
def update_comment(access_token: str, comment_id: int, title: str, content: str):
    return { 
        "comment_id": 1,
        "parent_id": None,
        "post_id": 1,
        "user_id": 1,
        "content": "Reply's content",
    }

@app.delete("/posts/comments/{comment_id}")
def delete_comment(access_token: str, comment_id: id):
    return {"message": "Comment deleted"}

@app.get("/posts/comments/{post_id}")
def get_comments(access_token: str, comment_id: int):
    return {[ 
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
    ]}

@app.get("/posts/comments/{comment_id}")
def get_comment(access_token: str, comment_id: int, title: str, content: str):
    return { 
        "comment_id": 1,
        "parent_id": None,
        "post_id": 1,
        "user_id": 1,
        "content": "Comments's content",
    }

@app.get("/posts/comments/{comment_id}/ancestors")
def get_comment(access_token: str, comment_id: int, title: str, content: str):
    return {[ 
        {
            "comment_id": 1,
            "parent_id": None,
            "post_id": 1,
            "user_id": 1,
            "content": "Comments's content",
        }
    ]}

@app.get("/posts/comments/{comment_id}/breadcrumb")
def get_comment(access_token: str, comment_id: int, title: str, content: str):
    return {[ 
        {
            "comment_id": 2,
            "parent_id": 1,
            "post_id": 1,
            "user_id": 1,
            "content": "Reply's content",
        },
    ]}