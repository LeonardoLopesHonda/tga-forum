import pytest
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy import StaticPool, create_engine
from sqlalchemy.orm import sessionmaker

from db.database import Base, get_db
from services.auth import get_current_user
from models.token import TokenData
from main import app

TEST_USER_ID = uuid4()

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

def override_get_current_user():
    return TokenData(user_id=TEST_USER_ID, email="test@example.com")

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()

def create_post(title: str, content: str) -> dict:
    response = client.post("/api/v1/posts", json={"title": title, "content": content})
    assert response.status_code == 200, response.text
    return response.json()

def create_comment(post_id: int, content: str, parent_id: int | None = None) -> dict:
    response = client.post(f"/api/v1/posts/{post_id}/comments", json={
        "content": content,
        "parent_id": parent_id
    })
    assert response.status_code == 200, response.text
    return response.json()

def create_reply(parent_id: int, content: str) -> dict:
    response = client.post(f"/api/v1/comments/{parent_id}/replies", json={
        "content": content,
        "parent_id": parent_id
    })
    assert response.status_code == 200, response.text
    return response.json()

def test_user_creates_a_comment():
    post = create_post("post1", "amazing post")
    response = client.post(f"/api/v1/posts/{post['post_id']}/comments", json={
        "content": "It's a lot of light-years wide"
    })
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["user_id"] == str(TEST_USER_ID)
    assert data["post_id"] == post["post_id"]
    assert data["content"] == "It's a lot of light-years wide"

def test_loads_all_comments():
    post = create_post("post1", "amazing post")
    create_comment(post["post_id"], "comment1")
    create_comment(post["post_id"], "comment2")
    create_comment(post["post_id"], "comment3")
    response = client.get(f"/api/v1/posts/{post['post_id']}/comments")
    assert response.status_code == 200, response.text
    data = response.json()
    assert type(data) is list
    assert len(data) == 3

def test_create_a_reply():
    post = create_post("post1", "amazing post")
    parent = create_comment(post["post_id"], "comment1")
    response = client.post(f"/api/v1/comments/{parent['comment_id']}/replies", json={
        "content": "A cool reply",
        "parent_id": parent["comment_id"]
    })
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["parent_id"] == parent["comment_id"]
    assert data["post_id"] == post["post_id"]
    assert data["user_id"] == str(TEST_USER_ID)

def test_loads_comment_ancestors():
    post = create_post("post1", "amazing post")
    root = create_comment(post["post_id"], "comment1")
    parent = create_reply(root["comment_id"], "reply1")
    child = create_reply(parent["comment_id"], "reply2")
    response = client.get(f"/api/v1/comments/{child['comment_id']}/ancestors")
    assert response.status_code == 200, response.text
    data = response.json()
    assert type(data) is list
    assert len(data) == 2
    assert data[0]["post_id"] == post["post_id"]
    assert data[1]["post_id"] == post["post_id"]

def test_loads_comment_breadcrumb():
    post = create_post("post1", "amazing post")
    root = create_comment(post["post_id"], "comment1")
    parent = create_reply(root["comment_id"], "reply1")
    child = create_reply(parent["comment_id"], "reply2")
    response = client.get(f"/api/v1/comments/{child['comment_id']}/breadcrumb")
    assert response.status_code == 200, response.text
    data = response.json()
    assert type(data) is list
    assert len(data) == 3
    assert data[2]["comment_id"] == child["comment_id"]
    assert data[2]["parent_id"] == parent["comment_id"]
    assert data[2]["content"] == "reply2"

def test_user_edits_a_comment():
    post = create_post("post1", "amazing post")
    comment = create_comment(post["post_id"], "comment1")
    response = client.put(f"/api/v1/comments/{comment['comment_id']}", json={
        "content": "I chaaaangeeed"
    })
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["user_id"] == str(TEST_USER_ID)
    assert data["post_id"] == post["post_id"]
    assert data["content"] == "I chaaaangeeed"

def test_user_deletes_a_comment():
    post = create_post("post1", "amazing post")
    comment = create_comment(post["post_id"], "comment1")
    response = client.delete(f"/api/v1/comments/{comment['comment_id']}")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["message"] == "Comment deleted"
