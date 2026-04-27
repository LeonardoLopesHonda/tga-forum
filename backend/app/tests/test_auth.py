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

def test_user_authentication():
    response = client.post("/api/v1/user", json={
        "username": "test_read",
        "email": "test_read@gmail.com",
        "password": "12345678",
    })
    assert response.status_code == 200, response.text

    response = client.post("/api/v1/auth", data={
        "username": "test_read@gmail.com",
        "password": "12345678",
    })

    data = response.json()
    assert data["access_token"]
    assert data["token_type"] == "bearer"

def test_user_authorized_request():
    response = client.post("/api/v1/user", json={
        "username": "authorized",
        "email": "authorized@gmail.com",
        "password": "12345678",
    })
    assert response.status_code == 200, response.text
    user = response.json()
    user_id = user["user_id"]

    response = client.post("/api/v1/auth", data={
        "username": "authorized@gmail.com",
        "password": "12345678",
    })
    data = response.json()
    access_token = data["access_token"]

    response = client.get(f"/api/v1/user/{user_id}", headers={"Authorization": f"Bearer {access_token}"})
    data = response.json()
    assert response.status_code == 200, response.text
    assert data["username"] == "authorized"
    assert data["email"] == "authorized@gmail.com"

def test_user_unauthorized_request():
    response = client.post("/api/v1/user", json={
        "username": "unauthorized",
        "email": "unauthorized@gmail.com",
        "password": "12345678",
    })
    assert response.status_code == 200, response.text

    user = response.json()

    response = client.get(f"/api/v1/user/{user["user_id"]}")
    assert response.status_code == 401, response.text

def test_reject_wrong_email():
    response = client.post("/api/v1/user", json={
        "username": "user",
        "email": "user@gmail.com",
        "password": "12345678",
    })
    assert response.status_code == 200, response.text

    response = client.post("/api/v1/auth", data={
        "username": "wrong@gmail.com",
        "password": "12345678",
    })
    assert response.status_code == 401, response.text

def test_reject_wrong_password():
    response = client.post("/api/v1/user", json={
        "username": "user",
        "email": "user@gmail.com",
        "password": "12345678",
    })
    assert response.status_code == 200, response.text

    response = client.post("/api/v1/auth", data={
        "username": "user@gmail.com",
        "password": "87654321",
    })
    assert response.status_code == 401, response.text