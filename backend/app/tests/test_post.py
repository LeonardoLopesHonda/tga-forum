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

def test_user_creates_a_post():
    response = client.post("/api/v1/posts", json={
        "title": "What is the Great Attractor?",
        "content": "It's a curious observation that..."
    })
    data = response.json()
    assert response.status_code == 200, response.text
    assert data["title"] == "What is the Great Attractor?"
    assert data["content"] == "It's a curious observation that..."
    assert data["user_id"] == str(TEST_USER_ID)

def test_loads_all_posts():
    create_post("post1", "amazing post")
    create_post("post2", "not so amazing as post1")
    response = client.get("/api/v1/posts")
    data = response.json()
    assert response.status_code == 200, response.text
    assert type(data) is list
    assert len(data) == 2

def test_loads_a_specific_post():
    post = create_post("post1", "amazing post")
    response = client.get(f"/api/v1/posts/{post['post_id']}")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["user_id"] == str(TEST_USER_ID)
    assert data["title"] == "post1"
    assert data["content"] == "amazing post"

def test_user_edits_a_post():
    post = create_post("post1", "amazing post")
    response = client.put(f"/api/v1/posts/{post['post_id']}", json={
        "content": "really really amazing post"
    })
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["title"] == "post1"
    assert data["content"] == "really really amazing post"

def test_user_deletes_a_post():
    post = create_post("post1", "amazing post")
    response = client.delete(f"/api/v1/posts/{post['post_id']}")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["message"] == "Post deleted"