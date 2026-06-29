from typing import List
from models.task import Task
from services.gemini import GeminiService

class IntakeAgent:
    """
    IntakeAgent is responsible for processing unstructured user inputs (like voice notes, 
    quick text notes, emails, etc.) and using LLMs to extract clean Task structures.
    """
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service

    async def extract_tasks_from_input(self, user_input: str) -> List[Task]:
        """
        Parses the raw input string and attempts to extract one or more tasks.
        
        Args:
            user_input (str): The raw text provided by the user (e.g. "Draft an email to client tomorrow by 10am").

        Returns:
            List[Task]: A list of extracted Task instances containing structured values.
        """
        # TODO: Construct prompt and call gemini_service.generate_structured_json
        pass

    async def refine_task_with_feedback(self, existing_task: Task, feedback: str) -> Task:
        """
        Refines a previously extracted task based on user conversational corrections.

        Args:
            existing_task (Task): The current state of the task.
            feedback (str): Feedback content (e.g. "No, actually that's due on Friday instead of tomorrow").

        Returns:
            Task: The modified and corrected Task instance.
        """
        # TODO: Process refinements
        pass
