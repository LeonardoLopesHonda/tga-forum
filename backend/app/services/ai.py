from fastapi import HTTPException
import openai
from models.ai import AiCreate, AiPostAssistResponse
from core.config import settings
from openai import OpenAI
import json

SYSTEM_PROMPT = """
    You are a writing assistant for a space-focused technical forum.

    Your task:
    Given a post title and/or partial content, help the user create a high-quality technical post about:
    - Space
    - Astronomy
    - Aerospace engineering

    Rules:
    1. If only a title is provided:
    - Generate the post content.
    - Set "title" to null.

    2. If only content is provided:
    - Suggest a fitting title.
    - Set "content" to null.

    3. If both title and content are provided:
    - Improve and refine the content.
    - Set "title" to null.

    Response format:
    Always return valid JSON exactly in this structure:
    {
    "title": "text" or null,
    "content": "text" or null
    }
"""

def build_message(body: AiCreate):
    parts = []
    if body.title:
        parts.append(f"Title: {body.title}")
    if body.content:
        parts.append(f"Content: {body.content}")
    return "\n".join(parts)

def generate_response(user_message: str):
    try: 
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ]
        )
        raw = response.choices[0].message.content
        data = json.loads(raw)
        return AiPostAssistResponse(
            title=data.get("title"),
            content=data.get("content"),
        )
    except openai.OpenAIError:
        raise HTTPException(status_code=502, detail="AI service unavailable")