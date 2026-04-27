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

def setup_post(title: str, content: str):
    user = setup_user().json()
    access_token = user["access_token"]
    return client.post(f"/api/v1/posts", headers={"Authorization": f"Bearer {access_token}"}, json={
        "title": title,
        "content": content
    })

def test_user_creates_a_post():
    access_token = setup_user().json()["access_token"]
    response = client.post(f"/api/v1/posts", headers={"Authorization": f"Bearer {access_token}"}, json={
        "title": "What is the Great Attactor?",
        "content": "It's a curious observation that..."
    })
    data = response.json()
    assert response.status_code == 200, response.text
    assert data["title"] == "What is the Great Attactor?"
    assert data["content"] == "It's a curious observation that..."

def test_loads_all_posts():
    setup_post("post1", "amazing post")
    setup_post("post2", "not so amazing as post1")
    response = client.get(f"/api/v1/posts")
    data = response.json()
    assert response.status_code == 200, response.text
    assert type(data) is list
    assert len(data) == 2

def test_loads_a_specific_post():
    post = setup_post("post1", "amazing post").json()
    response = client.get(f"/api/v1/posts/{post["post_id"]}")
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["user_id"] == 1
    assert data["title"] == "post1"
    assert data["content"] == "amazing post"

def test_user_edits_a_post():
    access_token = setup_user().json()["access_token"]
    post = setup_post("post1", "amazing post").json()
    response = client.put(f"/api/v1/posts/{post["post_id"]}", headers={"Authorization": f"Bearer {access_token}"}, json={
        "content": "really really amazing post"
    })
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["title"] == "post1"
    assert data["content"] == "really really amazing post"

def test_user_deletes_a_post():
    access_token = setup_user().json()["access_token"]
    post = setup_post("post1", "amazing post").json()
    response = client.delete(f"/api/v1/posts/{post["post_id"]}", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["message"] == "Post deleted"