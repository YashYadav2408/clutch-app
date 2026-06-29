from typing import List
from models.task import Task, Priority
from services.gemini import GeminiService

class PrioritizerAgent:
    """
    PrioritizerAgent analyzes task characteristics (urgency, impact, dependencies, deadlines)
    and applies Eisenhower Matrix logic to classify and recommend task rankings.
    """
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service

    async def determine_task_priority(self, task: Task) -> Priority:
        """
        Analyzes task info to assign an appropriate Priority level.

        Args:
            task (Task): The task to evaluate.

        Returns:
            Priority: Assigned Priority level (low, medium, high, urgent).
        """
        # TODO: Run prompt scoring task importance vs. urgency
        pass

    async def optimize_task_queue(self, tasks: List[Task]) -> List[Task]:
        """
        Takes a list of user tasks and sorts them, returning a recommended order of execution
        based on deadlines, priority weightings, and size.

        Args:
            tasks (List[Task]): The user's list of tasks.

        Returns:
            List[Task]: Reordered list of tasks optimized for user productivity.
        """
        # TODO: Compute mathematical priority score or consult LLM
        pass
