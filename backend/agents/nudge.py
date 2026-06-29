from typing import List
from models.task import Task
from services.gemini import GeminiService

class NudgeAgent:
    """
    NudgeAgent monitors tasks status and deadlines to draft personalized, 
    non-annoying motivational reminders (nudges) to help users stay on track.
    """
    def __init__(self, gemini_service: GeminiService):
        self.gemini_service = gemini_service

    async def scan_for_nudge_opportunities(self, tasks: List[Task]) -> List[Task]:
        """
        Scans the user's task list to identify items that are overdue, nearing deadline, 
        or stalled, which would benefit from a proactive notification nudge.

        Args:
            tasks (List[Task]): The user's list of tasks.

        Returns:
            List[Task]: Sub-collection of tasks that require a nudge.
        """
        # TODO: Filter tasks requiring notifications
        pass

    async def create_motivational_nudge(self, task: Task) -> str:
        """
        Generates a friendly, personalized notification text using Gemini.

        Args:
            task (Task): The task target for the nudge.

        Returns:
            str: Custom notification text (e.g., "Hey! You've got 'Prepare Pitch Deck' due in 3 hours. Ready to spend 15 mins on it?").
        """
        # TODO: Construct prompt asking for short, supportive push copy
        pass
