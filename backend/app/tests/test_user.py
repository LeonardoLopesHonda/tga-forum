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

def test_create_a_user():
    response = client.post("/api/v1/user", json={
        "username": "test",
        "email": "test@gmail.com",
        "password": "12345678",
    })
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["username"] == "test"
    assert data["email"] == "test@gmail.com"

def test_update_a_user():
    response = client.post("/api/v1/user", json={
        "username": "authorized_update",
        "email": "authorized_update@gmail.com",
        "password": "12345678",
    })
    assert response.status_code == 200, response.text
    user = response.json()
    user_id = user["user_id"]

    response = client.post("/api/v1/auth", data={
        "username": "authorized_update@gmail.com",
        "password": "12345678",
    })
    data = response.json()
    access_token = data["access_token"]

    response = client.put(f"/api/v1/user/{user_id}", 
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "username": "updated_user",
            "email": "updated_email@gmail.com",
            "password": "87654321"
        })
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["username"] == "updated_user"
    assert data["email"] == "updated_email@gmail.com"

def test_delete_a_user():
    response = client.post("/api/v1/user", json={
        "username": "delete_user",
        "email": "delete_user@gmail.com",
        "password": "12345678",
    })
    assert response.status_code == 200, response.text
    user = response.json()
    user_id = user["user_id"]

    response = client.post("/api/v1/auth", data={
        "username": "delete_user@gmail.com",
        "password": "12345678",
    })
    data = response.json()
    access_token = data["access_token"]

    response = client.delete(f"/api/v1/user/{user_id}", headers={"Authorization": f"Bearer {access_token}"})
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["message"] == "User Deleted"

# TODO: Write a test for the same email
# TODO: Write a test for wrong email
# TODO: Write a test for wrong password