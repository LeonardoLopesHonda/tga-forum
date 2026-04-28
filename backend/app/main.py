from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import create_tables
from api.routes.auth import router as auth_router
from api.routes.user import router as user_router
from api.routes.post import router as post_router
from api.routes.comment import router as comment_router

app = FastAPI()
create_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")
app.include_router(post_router, prefix="/api/v1")
app.include_router(comment_router, prefix="/api/v1")

'''
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
'''