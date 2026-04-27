import pytest
from fastapi.testclient import TestClient
from sqlalchemy import StaticPool, create_engine
from sqlalchemy.orm import sessionmaker

from db.database import Base, get_db
from main import app

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

def setup_user():
    response = client.post("/api/v1/user", json={
        "username": "user",
        "email": "user@gmail.com",
        "password": "12345678",
    })

    return client.post("/api/v1/auth", data={
        "username": "user@gmail.com",
        "password": "12345678",
    })

def setup_post(title: str, content: str, access_token: int | None = None):
    if access_token is None:
        user = setup_user().json()
        access_token = user["access_token"]
    return client.post(f"/api/v1/posts", headers={"Authorization": f"Bearer {access_token}"}, json={
        "title": title,
        "content": content
    })

def setup_comment(content: str, post_id: int, access_token: int | None = None, parent_id: int | None = None):
    if access_token is None:
        user = setup_user().json()
        access_token = user["access_token"]
    return client.post(f"/api/v1/posts/{post_id}/comments", 
        headers={"Authorization": f"Bearer {access_token}"}, 
        json={
            "content": content,
            "parent_id": parent_id
        })

def setup_reply(content: str, parent_id: int, access_token: int | None = None):
    if access_token is None:
        user = setup_user().json()
        access_token = user["access_token"]
    return client.post(f"/api/v1/comments/{parent_id}/replies", 
        headers={"Authorization": f"Bearer {access_token}"}, 
        json={
            "content": content,
            "parent_id": parent_id
        })

def test_user_creates_a_comment():
    user = setup_user().json()
    access_token = user["access_token"]
    post = setup_post("post1", "amazing post", access_token).json()

    response = client.post(f"/api/v1/posts/{post["post_id"]}/comments", 
        headers={"Authorization": f"Bearer {access_token}"}, 
        json={
            "content": "It's a lot of light-years wide"
        })
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["user_id"] == 1
    assert data["post_id"] == 1
    assert data["content"] == "It's a lot of light-years wide"

def test_loads_all_comments():
    user = setup_user().json()
    access_token = user["access_token"]
    post = setup_post("post1", "amazing post", access_token).json()
    setup_comment("comment1", post["user_id"], access_token)
    setup_comment("comment2", post["user_id"], access_token)
    setup_comment("comment3", post["user_id"], access_token)

    response = client.get(f"/api/v1/posts/{post["user_id"]}/comments")
    assert response.status_code == 200, response.text

    data = response.json()
    assert type(data) is list
    assert len(data) == 3

def test_create_a_reply():
    user = setup_user().json()
    access_token = user["access_token"]
    post = setup_post("post1", "amazing post", access_token).json()
    parent = setup_comment("comment1", post["user_id"], access_token).json()

    response = client.post(f"/api/v1/comments/{parent["comment_id"]}/replies", 
        headers={"Authorization": f"Bearer {access_token}"}, 
        json={
            "content": "A cool reply"
        })
    assert response.status_code == 200, response.text
        
    data = response.json()
    assert type(data) is dict
    assert data["comment_id"] == 2
    assert data["parent_id"] == 1
    assert data["post_id"] == 1
    assert data["user_id"] == 1

def test_loads_comment_ancestors():
    user = setup_user().json()
    access_token = user["access_token"]
    post = setup_post("post1", "amazing post", access_token).json()
    root_parent = setup_comment("comment1", post["user_id"], access_token).json()
    parent = setup_reply("reply1", root_parent["comment_id"], access_token).json()
    child = setup_reply("reply2", parent["comment_id"], access_token).json()

    response = client.get(f"/api/v1/comments/{child["comment_id"]}/ancestors")
    assert response.status_code == 200, response.text

    data = response.json()
    assert type(data) is list
    assert len(data) == 2
    assert data[0]["user_id"] and data[1]["user_id"]
    assert data[0]["post_id"] and data[1]["post_id"]

def test_loads_comment_breadcrumb():
    user = setup_user().json()
    access_token = user["access_token"]
    post = setup_post("post1", "amazing post", access_token).json()
    root_parent = setup_comment("comment1", post["user_id"], access_token).json()
    parent = setup_reply("reply1", root_parent["comment_id"], access_token).json()
    child = setup_reply("reply2", parent["comment_id"], access_token).json()

    response = client.get(f"/api/v1/comments/{child["comment_id"]}/breadcrumb")
    assert response.status_code == 200, response.text

    data = response.json()
    assert type(data) is list
    assert len(data) == 3
    assert data[0]["user_id"] and data[1]["user_id"]
    assert data[0]["post_id"] and data[1]["post_id"]
    assert data[2]["user_id"] and data[2]["post_id"] \
        and data[2]["comment_id"] == 3 \
        and data[2]["parent_id"] == 2 \
        and data[2]["content"] == "reply2"

def test_user_edits_a_comment():
    user = setup_user().json()
    access_token = user["access_token"]
    post = setup_post("post1", "amazing post", access_token).json()
    comment = setup_comment("comment1", post["user_id"], access_token).json()

    response = client.put(f"/api/v1/comments/{comment["comment_id"]}", 
        headers={"Authorization": f"Bearer {access_token}"}, 
        json={
            "content": "I chaaaangeeed"
        })
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["user_id"] == 1
    assert data["post_id"] == 1
    assert data["content"] == "I chaaaangeeed"

def test_user_deletes_a_comment():
    user = setup_user().json()
    access_token = user["access_token"]
    post = setup_post("post1", "amazing post", access_token).json()
    comment = setup_comment("comment1", post["user_id"], access_token).json()

    response = client.delete(f"/api/v1/comments/{comment["comment_id"]}", 
        headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 200, response.text

    data = response.json()
    assert data["message"] == "Comment deleted"
