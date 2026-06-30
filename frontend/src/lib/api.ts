const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface TaskData {
  id: string;
  task_title: string;
  subtasks: SubTaskData[];
  estimated_total_minutes: number;
  suggested_deadline: string;
  priority_level: "high" | "medium" | "low";
  priority_score: number;
  reasoning: string;
  quick_win: string;
  completed: boolean;
  created_at: string;
  calendar_event_id?: string;
}

interface SubTaskData {
  step: number;
  title: string;
  duration_minutes: number;
  description: string;
  completed: boolean;
}



export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  endpoint: string,
  method: string = "GET",
  body?: object
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) {
      const message =
        typeof data?.detail === "string" ? data.detail : "API error";
      throw new Error(message);
    }
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export const planTask = (userInput: string, userId: string) =>
  fetchApi<{ task: TaskData }>("/tasks/plan", "POST", {
    user_input: userInput,
    user_id: userId,
  });

export const getUserTasks = (userId: string) =>
  fetchApi<{ tasks: TaskData[] }>(`/tasks/${userId}`);

export const prioritizeTasks = (userId: string) =>
  fetchApi(`/agent/prioritize/${userId}`, "POST");

export const getNudge = (
  taskTitle: string,
  deadline: string,
  timeRemaining: string
) =>
  fetchApi<{ message: string }>(
    `/agent/nudge?task_title=${encodeURIComponent(
      taskTitle
    )}&deadline=${encodeURIComponent(deadline)}&time_remaining=${encodeURIComponent(
      timeRemaining
    )}`
  );

export const updateTask = (userId: string, taskId: string, updates: object) =>
  fetchApi(`/tasks/${userId}/${taskId}`, "PATCH", updates);

export const deleteTask = (userId: string, taskId: string) =>
  fetchApi(`/tasks/${userId}/${taskId}`, "DELETE");

export const updateSubtask = (
  userId: string,
  taskId: string,
  subtaskIndex: number,
  completed: boolean
) =>
  fetchApi(`/tasks/${userId}/${taskId}/subtask/${subtaskIndex}`, "PATCH", {
    completed,
  });