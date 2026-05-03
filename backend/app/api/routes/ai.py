from models.ai import AiCreate, AiPostAssistResponse
from services.auth import get_current_user
from services.ai import build_message, generate_response
from fastapi import APIRouter, Depends
from models.token import TokenData

router = APIRouter()

@router.post("/ai/post-assist", response_model=AiPostAssistResponse)
def create(body: AiCreate, current_user: TokenData = Depends(get_current_user)) -> AiPostAssistResponse:
    user_message = build_message(body)
    return generate_response(user_message)