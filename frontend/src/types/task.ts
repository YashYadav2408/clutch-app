export type Priority = "low" | "medium" | "high" | "urgent";

export interface SubTask {
  id?: string;
  title: string;
  description?: string;
  is_completed: boolean;
  due_date?: string;
}

export interface Task {
  id?: string;
  title: string;
  description?: string;
  priority: Priority;
  subtasks?: SubTask[];
  due_date?: string;
  created_at?: string;
  updated_at?: string;
}
