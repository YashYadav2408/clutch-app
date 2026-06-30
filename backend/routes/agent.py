from fastapi import APIRouter, HTTPException
from models.task import TaskInput, Task
from services.gemini import (
    run_planner_agent,
    run_prioritizer_agent,
    run_nudge_agent,
    get_client,
    PLANNER_PROMPT,
    clean_json,
    API_KEYS,
    json
)
from services.firebase import save_task, get_tasks
from datetime import datetime
import time

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/plan")
def run_planner_agent(user_input: str) -> dict:
    max_retries = len(API_KEYS) * 2
    for attempt in range(max_retries):
        try:
            prompt = PLANNER_PROMPT.format(
                current_datetime=datetime.now().strftime("%Y-%m-%d %H:%M"),
                user_input=user_input
            )
            response = get_client().models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=prompt
            )
            text = clean_json(response.text)
            return json.loads(text)
        except json.JSONDecodeError as e:
            return {"error": f"JSON parse error: {str(e)}"}
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "503" in error_str:
                print(f"Key failed, trying another... (attempt {attempt + 1})")
                continue
            return {"error": error_str}
    return {"error": "All API keys exhausted. Please try again in a minute."}

@router.post("/prioritize/{user_id}")
async def prioritize_tasks(user_id: str):
    try:
        tasks = get_tasks(user_id)
        if not tasks:
            return {"success": True, "tasks": []}
        prioritized = run_prioritizer_agent(tasks)
        return {"success": True, "tasks": prioritized}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/nudge")
async def get_nudge(task_title: str, deadline: str, time_remaining: str):
    try:
        message = run_nudge_agent(task_title, deadline, time_remaining)
        return {"success": True, "message": message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/briefing")
async def daily_briefing(body: dict):
    user_name = body.get("user_name", "there")
    tasks = body.get("tasks", "no tasks yet")
    prompt = f"""
You are Clutch, an AI productivity coach. Generate a short, energetic,
personalized morning briefing for {user_name}.
Their upcoming tasks are: {tasks}
Keep it under 3 sentences. Be motivating, specific, and reference their actual tasks.
Return only the briefing text, nothing else.
"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = get_client().models.generate_content(
                model="gemini-2.0-flash-lite",
                contents=prompt
            )
            return {"briefing": response.text.strip()}
        except Exception as e:
            error_str = str(e)
            if "503" in error_str or "UNAVAILABLE" in error_str:
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2
                    print(f"Model unavailable, retrying in {wait_time}s...")
                    time.sleep(wait_time)
                    continue
            raise HTTPException(status_code=500, detail=str(e))
    raise HTTPException(status_code=503, detail="Model temporarily unavailable, please try again")