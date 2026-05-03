from models.ai import AiCreate, AiPostAssistResponse
from openai import OpenAI, OpenAIError
from fastapi import HTTPException
from core.config import settings
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

def _parse(data: dict) -> AiPostAssistResponse:
    return AiPostAssistResponse(title=data.get("title"), content=data.get("content"))

def _generate_openai(user_message: str) -> AiPostAssistResponse:
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
        return _parse(json.loads(response.choices[0].message.content))
    except OpenAIError as e:
        print(f"[ai] OpenAI error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=502, detail=f"AI service unavailable: {e}")


def _generate_gemini(user_message: str) -> AiPostAssistResponse:
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json",
            ),
        )
        return _parse(json.loads(response.text))
    except Exception as e:
        print(f"[ai] Gemini error: {type(e).__name__}: {e}")
        raise HTTPException(status_code=502, detail=f"AI service unavailable: {e}")


def generate_response(user_message: str) -> AiPostAssistResponse:
    provider = settings.AI_PROVIDER
    if provider == "openai":
        return _generate_openai(user_message)
    elif provider == "gemini":
        return _generate_gemini(user_message)
    else:
        raise HTTPException(status_code=500, detail="Provider not recognized")