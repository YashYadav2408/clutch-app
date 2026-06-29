"use client";
import { useState } from "react";
import { Task } from "@/hooks/useTasks";
import { Card } from "@/components/ui/card";

interface TaskCardProps {
  task: Task;
  onComplete: () => void;
  onDelete: () => void;
  onUpdateSubtask: (taskId: string, subtaskIndex: number, completed: boolean) => void;
}

const priorityConfig = {
  high: { color: "bg-red-900 text-red-300 border-red-800", label: "High", dot: "bg-red-400" },
  medium: { color: "bg-amber-900 text-amber-300 border-amber-800", label: "Medium", dot: "bg-amber-400" },
  low: { color: "bg-green-900 text-green-300 border-green-800", label: "Low", dot: "bg-green-400" },
};

const getTimeRemaining = (deadline: string) => {
  const diff = new Date(deadline).getTime() - new Date().getTime();
  if (diff < 0) return { text: "Overdue", urgent: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return { text: `${days}d ${hours}h left`, urgent: days < 1 };
  return { text: `${hours}h left`, urgent: hours < 6 };
};

export const TaskCard = ({ task, onComplete, onDelete, onUpdateSubtask }: TaskCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const priority = priorityConfig[task.priority_level];
  const time = task.suggested_deadline ? getTimeRemaining(task.suggested_deadline) : null;

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <Card className={`bg-gray-900 border-gray-800 p-4 hover:border-gray-600 transition-all ${task.completed ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        {/* Complete button */}
        <button
          onClick={onComplete}
          className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
            task.completed ? "bg-green-500 border-green-500" : "border-gray-600 hover:border-white"
          }`}
        />

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-medium text-sm ${task.completed ? "line-through text-gray-500" : "text-white"}`}>
              {task.task_title}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${priority.color}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${priority.dot} mr-1`} />
              {priority.label}
            </span>
            {time && (
              <span className={`text-xs ${time.urgent ? "text-red-400" : "text-gray-500"}`}>
                ⏱ {time.text}
              </span>
            )}
          </div>

          {/* Quick win */}
          {task.quick_win && !task.completed && (
            <p className="text-xs text-gray-400 mt-1">
              ⚡ <span className="text-gray-300">{task.quick_win}</span>
            </p>
          )}

          {/* Progress bar — only show if subtasks exist */}
          {totalSubtasks > 0 && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {expanded ? "▲ Hide" : "▼ Show"} subtasks ({completedSubtasks}/{totalSubtasks})
                </button>
                <span className="text-xs text-gray-500">{progress}% done</span>
              </div>
              {/* Progress bar */}
              <div className="bg-gray-800 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    progress === 100 ? "bg-green-500" : progress > 50 ? "bg-blue-500" : "bg-purple-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Subtasks expanded */}
          {expanded && totalSubtasks > 0 && (
            <div className="mt-3 space-y-2 pl-2 border-l-2 border-gray-700">
              {task.subtasks.map((sub, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 p-2 rounded-lg transition-all hover:bg-gray-800 group ${
                    sub.completed ? "opacity-60" : ""
                  }`}
                >
                  {/* Subtask checkbox */}
                  <button
                    onClick={() => onUpdateSubtask(task.id, i, !sub.completed)}
                    className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                      sub.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-600 hover:border-green-400 group-hover:border-gray-400"
                    }`}
                  >
                    {sub.completed && <span className="text-xs">✓</span>}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${sub.completed ? "line-through text-gray-500" : "text-gray-300"}`}>
                      {sub.step}. {sub.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{sub.description}</p>
                    <span className="text-xs text-gray-600">⏱ {sub.duration_minutes} min</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="text-gray-600 hover:text-red-400 text-xs flex-shrink-0 transition-colors mt-1"
        >
          ✕
        </button>
      </div>
    </Card>
  );
};