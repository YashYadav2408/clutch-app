from fastapi import APIRouter, HTTPException
from models.task import TaskInput, TaskUpdate
from services.gemini import run_planner_agent
from services.firebase import save_task, get_tasks, get_task_by_id, update_task, delete_task
from services.calendar import create_calendar_event, delete_calendar_event
from datetime import datetime

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.post("/plan")
async def plan_and_save_task(input: TaskInput):
    try:
        plan = run_planner_agent(input.user_input)
        if "error" in plan:
            print(f"Planner error: {plan}")
            raise HTTPException(status_code=500, detail=str(plan))

        plan["user_id"] = input.user_id
        plan["created_at"] = datetime.now().isoformat()

        event_id = create_calendar_event(
            user_email=input.user_id,
            task_title=plan.get("task_title", "Task"),
            deadline=plan.get("suggested_deadline", ""),
            duration_minutes=plan.get("estimated_total_minutes", 60),
            description=plan.get("reasoning", "")
        )
        plan["calendar_event_id"] = event_id

        task_id = save_task(input.user_id, plan)
        plan["id"] = task_id

        return {"success": True, "task": plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}")
async def fetch_tasks(user_id: str):
    try:
        tasks = get_tasks(user_id)
        return {"success": True, "tasks": tasks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}/{task_id}")
async def fetch_task(user_id: str, task_id: str):
    try:
        task = get_task_by_id(user_id, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"success": True, "task": task}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{user_id}/{task_id}")
async def patch_task(user_id: str, task_id: str, updates: TaskUpdate):
    try:
        success = update_task(user_id, task_id, updates.dict(exclude_none=True))
        if not success:
            raise HTTPException(status_code=500, detail="Update failed")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}/{task_id}")
async def remove_task(user_id: str, task_id: str):
    try:
        task = get_task_by_id(user_id, task_id)
        if task.get("calendar_event_id"):
            delete_calendar_event(task["calendar_event_id"])
        success = delete_task(user_id, task_id)
        if not success:
            raise HTTPException(status_code=500, detail="Delete failed")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.patch("/{user_id}/{task_id}/subtask/{subtask_index}")
async def update_subtask_status(user_id: str, task_id: str, subtask_index: int, body: dict):
    try:
        from services.firebase import update_subtask
        completed = body.get("completed", False)
        success = update_subtask(user_id, task_id, subtask_index, completed)
        if not success:
            raise HTTPException(status_code=500, detail="Subtask update failed")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))