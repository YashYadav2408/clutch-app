from google import genai
import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

PLANNER_PROMPT = """
You are Clutch, an elite AI productivity coach. A user has given you a task or goal.
Your job is to break it down into a clear, actionable plan.

Priority level rules — follow these STRICTLY:
- "high": deadline within 24 hours OR extremely critical (job interview, exam, medical)
- "medium": deadline within 2-5 days OR moderately important (assignments, meetings, bills)
- "low": deadline beyond 5 days OR not time sensitive (reading, personal goals, optional tasks)

Priority score rules:
- high = 75-100
- medium = 40-74  
- low = 1-39

Return ONLY a valid JSON object with this exact structure, no extra text, no markdown, no backticks:
{{
  "task_title": "short clear title",
  "subtasks": [
    {{"step": 1, "title": "subtask title", "duration_minutes": 30, "description": "what to do"}}
  ],
  "estimated_total_minutes": 90,
  "suggested_deadline": "YYYY-MM-DD HH:MM",
  "priority_level": "high or medium or low based on rules above",
  "priority_score": 85,
  "reasoning": "why this priority and deadline",
  "quick_win": "the single most impactful first action to take right now"
}}

Today's date and time: {current_datetime}
User's task: {user_input}

Think carefully about the deadline and importance before assigning priority.
"""

PRIORITIZER_PROMPT = """
You are Clutch, an AI productivity coach. You have a list of tasks.
Rank them by urgency and importance using the Eisenhower Matrix logic.

Return ONLY a valid JSON array, no extra text, no markdown, no backticks:
[
  {{
    "task_id": "original task id",
    "task_title": "task title",
    "urgency_score": 90,
    "importance_score": 85,
    "final_priority": "high",
    "recommended_action": "do_now",
    "reasoning": "brief reason"
  }}
]

Today's date: {current_datetime}
Tasks: {tasks_json}
"""

NUDGE_PROMPT = """
You are Clutch, a proactive AI productivity companion.
Based on the user's upcoming deadlines and current time, craft a short,
personalized, motivating nudge message (max 2 sentences).
Be specific, not generic. Reference the actual task name and deadline.

Current time: {current_datetime}
Task: {task_title}
Deadline: {deadline}
Time remaining: {time_remaining}

Return ONLY the nudge message text, nothing else.
"""

def clean_json(text: str) -> str:
    text = text.strip()
    if "```" in text:
        parts = text.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{") or part.startswith("["):
                return part
    return text

import time

def run_planner_agent(user_input: str) -> dict:
    max_retries = 3
    for attempt in range(max_retries):
        try:
            prompt = PLANNER_PROMPT.format(
                current_datetime=datetime.now().strftime("%Y-%m-%d %H:%M"),
                user_input=user_input
            )
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt
            )
            text = clean_json(response.text)
            result = json.loads(text)
            return result
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            return {"error": f"JSON parse error: {str(e)}"}
        except Exception as e:
            error_str = str(e)
            if "503" in error_str or "UNAVAILABLE" in error_str:
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 3
                    print(f"Model unavailable, retrying in {wait_time}s... (attempt {attempt + 1})")
                    time.sleep(wait_time)
                    continue
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                return {"error": "API quota exceeded. Please try again in a minute."}
            return {"error": error_str}
    return {"error": "Model temporarily unavailable. Please try again in a few seconds."}

def run_prioritizer_agent(tasks: list) -> list:
    try:
        prompt = PRIORITIZER_PROMPT.format(
            current_datetime=datetime.now().strftime("%Y-%m-%d %H:%M"),
            tasks_json=json.dumps(tasks, indent=2)
        )
        response = client.models.generate_content(
           model="gemini-2.5-flash-lite",
            contents=prompt
        )
        text = clean_json(response.text)
        return json.loads(text)
    except Exception as e:
        print(f"Prioritizer agent error: {e}")
        return [{"error": str(e)}]

def run_nudge_agent(task_title: str, deadline: str, time_remaining: str) -> str:
    try:
        prompt = NUDGE_PROMPT.format(
            current_datetime=datetime.now().strftime("%Y-%m-%d %H:%M"),
            task_title=task_title,
            deadline=deadline,
            time_remaining=time_remaining
        )
        response = client.models.generate_content(
          model="gemini-2.5-flash-lite",
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"Nudge agent error: {e}")
        return f"Don't forget: {task_title} is due {deadline}!"