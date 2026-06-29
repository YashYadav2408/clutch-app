from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PriorityLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class SubTask(BaseModel):
    step: int
    title: str
    duration_minutes: int
    description: str
    completed: bool = False

class Task(BaseModel):
    id: Optional[str] = None
    user_id: str
    task_title: str
    subtasks: List[SubTask] = []
    estimated_total_minutes: int = 0
    suggested_deadline: Optional[str] = None
    priority_level: PriorityLevel = PriorityLevel.MEDIUM
    priority_score: int = 50
    reasoning: Optional[str] = None
    quick_win: Optional[str] = None
    completed: bool = False
    created_at: Optional[str] = None
    calendar_event_id: Optional[str] = None

class TaskInput(BaseModel):
    user_input: str
    user_id: str

class TaskUpdate(BaseModel):
    completed: Optional[bool] = None
    priority_level: Optional[PriorityLevel] = None
    suggested_deadline: Optional[str] = None