import { useState, useEffect, useCallback, useRef } from "react";
import { getUserTasks, planTask, updateTask, deleteTask, prioritizeTasks } from "@/lib/api";

export interface SubTask {
  step: number;
  title: string;
  duration_minutes: number;
  description: string;
  completed: boolean;
}

export interface Task {
  id: string;
  task_title: string;
  subtasks: SubTask[];
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

export const useTasks = (userId: string | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const hasFetched = useRef(false);
  const isAdding = useRef(false);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getUserTasks(userId) as any;
      if (res.success) setTasks(res.data?.tasks || []);
      else setError(res.error || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || hasFetched.current) return;
    hasFetched.current = true;
    fetchTasks();
  }, [userId, fetchTasks]);

  const addTask = async (userInput: string) => {
    if (!userId || isAdding.current) return { success: false };
    isAdding.current = true;
    setAdding(true);
    try {
      const res = await planTask(userInput, userId) as any;
      if (res.success) {
        setTasks(prev => {
          const exists = prev.find(t => t.id === res.data?.task?.id);
          if (exists) return prev;
          return [res.data?.task, ...prev];
        });
        return { success: true, task: res.data?.task };
      } else {
        setError(res.error || "Failed to add task");
        return { success: false };
      }
    } finally {
      setAdding(false);
      isAdding.current = false;
    }
  };

  const completeTask = async (taskId: string) => {
    if (!userId) return;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
    await updateTask(userId, taskId, { completed: true });
  };

  const removeTask = async (taskId: string) => {
    if (!userId) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await deleteTask(userId, taskId);
  };

  const prioritize = async () => {
    if (!userId) return;
    const res = await prioritizeTasks(userId) as any;
    if (res.success) await fetchTasks();
  };

  const updateSubtaskStatus = async (taskId: string, subtaskIndex: number, completed: boolean) => {
    if (!userId) return;
    const { updateSubtask } = await import("@/lib/api");
    await updateSubtask(userId, taskId, subtaskIndex, completed);
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const updatedSubtasks = [...t.subtasks];
      updatedSubtasks[subtaskIndex] = { ...updatedSubtasks[subtaskIndex], completed };
      return { ...t, subtasks: updatedSubtasks };
    }));
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => {
      if (!t.suggested_deadline || t.completed) return false;
      return new Date(t.suggested_deadline) < new Date();
    }).length,
    high_priority: tasks.filter(t => t.priority_level === "high" && !t.completed).length,
  };

  return { tasks, loading, error, adding, addTask, completeTask, removeTask, prioritize, refetch: fetchTasks, stats, updateSubtaskStatus };
};