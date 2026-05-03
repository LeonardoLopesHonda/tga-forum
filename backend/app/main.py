from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import create_tables
from api.routes.comment import router as comment_router
from api.routes.auth import router as auth_router
from api.routes.user import router as user_router
from api.routes.post import router as post_router
from api.routes.ai import router as ai_router

app = FastAPI()
create_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://tga-forum.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For render to load backend
@app.get("/")
def root():
    return {"status": "online"}

app.include_router(auth_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")
app.include_router(post_router, prefix="/api/v1")
app.include_router(comment_router, prefix="/api/v1")
app.include_router(ai_router, prefix="/api/v1")