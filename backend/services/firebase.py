import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

db = None

def initialize_firebase():
    global db
    if not firebase_admin._apps:
        cred_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
        if not cred_json:
            print("WARNING: Firebase not configured yet, skipping initialization")
            return
        try:
            cred_dict = json.loads(cred_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("Firebase initialized successfully")
        except Exception as e:
            print(f"Firebase initialization error: {e}")
            return

initialize_firebase()

def save_task(user_id: str, task_dict: dict) -> str:
    if not db:
        print("Firebase not initialized")
        return "mock-task-id"
    try:
        task_dict["created_at"] = datetime.now().isoformat()
        ref = db.collection("users").document(user_id).collection("tasks").add(task_dict)
        return ref[1].id
    except Exception as e:
        print(f"Error saving task: {e}")
        return ""

def get_tasks(user_id: str) -> list:
    if not db:
        return []
    try:
        docs = db.collection("users").document(user_id).collection("tasks").stream()
        tasks = []
        for doc in docs:
            task = doc.to_dict()
            task["id"] = doc.id
            tasks.append(task)
        return tasks
    except Exception as e:
        print(f"Error getting tasks: {e}")
        return []

def get_task_by_id(user_id: str, task_id: str) -> dict:
    if not db:
        return {}
    try:
        doc = db.collection("users").document(user_id).collection("tasks").document(task_id).get()
        if doc.exists:
            task = doc.to_dict()
            task["id"] = doc.id
            return task
        return {}
    except Exception as e:
        print(f"Error getting task: {e}")
        return {}

def update_task(user_id: str, task_id: str, updates: dict) -> bool:
    if not db:
        return True
    try:
        updates["updated_at"] = datetime.now().isoformat()
        db.collection("users").document(user_id).collection("tasks").document(task_id).update(updates)
        return True
    except Exception as e:
        print(f"Error updating task: {e}")
        return False

def delete_task(user_id: str, task_id: str) -> bool:
    if not db:
        return True
    try:
        db.collection("users").document(user_id).collection("tasks").document(task_id).delete()
        return True
    except Exception as e:
        print(f"Error deleting task: {e}")
        return False
    
def update_subtask(user_id: str, task_id: str, subtask_index: int, completed: bool) -> bool:
    if not db:
        return True
    try:
        task_ref = db.collection("users").document(user_id).collection("tasks").document(task_id)
        task = task_ref.get().to_dict()
        if not task:
            return False
        subtasks = task.get("subtasks", [])
        if subtask_index < len(subtasks):
            subtasks[subtask_index]["completed"] = completed
        task_ref.update({"subtasks": subtasks})
        return True
    except Exception as e:
        print(f"Error updating subtask: {e}")
        return False