from typing import List
from models.task import Task, SubTask
from services.gemini import GeminiService

class PlannerAgent:
    """
    PlannerAgent helps users break down a complex, high-level task into a 
    chronological sequence of bite-sized, actionable subtasks.
    """
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service

    async def breakdown_task(self, task: Task) -> List[SubTask]:
        """
        Decomposes a major parent task into a detailed set of SubTask items.

        Args:
            task (Task): The parent task containing title and description.

        Returns:
            List[SubTask]: A list of actionable subtask items generated to achieve the main goal.
        """
        # TODO: Call gemini_service with decomposition instructions
        pass

    async def estimate_subtask_durations(self, subtasks: List[SubTask]) -> List[SubTask]:
        """
        Appends time estimate recommendations (in minutes) to each subtask's description.

        Args:
            subtasks (List[SubTask]): A list of subtasks.

        Returns:
            List[SubTask]: The subtasks updated with recommended durations.
        """
        # TODO: Call gemini_service to forecast subtask complexity/timelines
        pass
