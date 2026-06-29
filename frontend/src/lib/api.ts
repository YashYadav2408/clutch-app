const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiResponse<T> {
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
    if (!response.ok) throw new Error(data.detail || "API error");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const planTask = (userInput: string, userId: string) =>
  fetchApi("/tasks/plan", "POST", { user_input: userInput, user_id: userId });

export const getUserTasks = (userId: string) =>
  fetchApi(`/tasks/${userId}`);

export const prioritizeTasks = (userId: string) =>
  fetchApi(`/agent/prioritize/${userId}`, "POST");

export const getNudge = (taskTitle: string, deadline: string, timeRemaining: string) =>
  fetchApi(`/agent/nudge?task_title=${encodeURIComponent(taskTitle)}&deadline=${encodeURIComponent(deadline)}&time_remaining=${encodeURIComponent(timeRemaining)}`);

export const updateTask = (userId: string, taskId: string, updates: object) =>
  fetchApi(`/tasks/${userId}/${taskId}`, "PATCH", updates);

export const deleteTask = (userId: string, taskId: string) =>
  fetchApi(`/tasks/${userId}/${taskId}`, "DELETE");

export const updateSubtask = (userId: string, taskId: string, subtaskIndex: number, completed: boolean) =>
  fetchApi(`/tasks/${userId}/${taskId}/subtask/${subtaskIndex}`, "PATCH", { completed });