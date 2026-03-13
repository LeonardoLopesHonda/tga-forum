from fastapi import FastAPI # type: ignore

app = FastAPI()

users = []
posts = []
comments = []

@app.get("/")
async def root():
    return {"message": "Hello World"}