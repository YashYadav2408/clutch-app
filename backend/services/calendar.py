from google.oauth2 import service_account
from googleapiclient.discovery import build
import os
import json
from datetime import datetime, timedelta

SCOPES = ["https://www.googleapis.com/auth/calendar"]

def get_calendar_service():
    cred_json = os.getenv("GOOGLE_CALENDAR_CREDENTIALS")
    if not cred_json:
        raise ValueError("GOOGLE_CALENDAR_CREDENTIALS not set")
    cred_dict = json.loads(cred_json)
    credentials = service_account.Credentials.from_service_account_info(
        cred_dict, scopes=SCOPES
    )
    return build("calendar", "v3", credentials=credentials)

def create_calendar_event(
    user_email: str,
    task_title: str,
    deadline: str,
    duration_minutes: int,
    description: str
) -> str:
    try:
        service = get_calendar_service()
        deadline_dt = datetime.strptime(deadline, "%Y-%m-%d %H:%M")
        start_dt = deadline_dt - timedelta(minutes=duration_minutes)
        event = {
            "summary": f"🎯 Clutch: {task_title}",
            "description": description,
            "start": {
                "dateTime": start_dt.isoformat(),
                "timeZone": "Asia/Kolkata"
            },
            "end": {
                "dateTime": deadline_dt.isoformat(),
                "timeZone": "Asia/Kolkata"
            },
            "attendees": [{"email": user_email}],
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "popup", "minutes": 30},
                    {"method": "email", "minutes": 60}
                ]
            }
        }
        created_event = service.events().insert(
            calendarId="primary",
            body=event,
            sendUpdates="all"
        ).execute()
        return created_event.get("id", "")
    except Exception as e:
        print(f"Error creating calendar event: {e}")
        return ""

def delete_calendar_event(event_id: str) -> bool:
    try:
        service = get_calendar_service()
        service.events().delete(calendarId="primary", eventId=event_id).execute()
        return True
    except Exception as e:
        print(f"Error deleting calendar event: {e}")
        return False

def get_upcoming_events(user_email: str, max_results: int = 10) -> list:
    try:
        service = get_calendar_service()
        now = datetime.utcnow().isoformat() + "Z"
        events_result = service.events().list(
            calendarId="primary",
            timeMin=now,
            maxResults=max_results,
            singleEvents=True,
            orderBy="startTime"
        ).execute()
        return events_result.get("items", [])
    except Exception as e:
        print(f"Error fetching events: {e}")
        return []