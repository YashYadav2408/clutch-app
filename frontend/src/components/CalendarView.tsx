"use client";
import { useState } from "react";
import { Task } from "@/hooks/useTasks";

interface CalendarViewProps {
  tasks: Task[];
}

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const priorityColor = {
  high: "bg-red-900 border-red-700 text-red-300",
  medium: "bg-amber-900 border-amber-700 text-amber-300",
  low: "bg-green-900 border-green-700 text-green-300",
};

export const CalendarView = ({ tasks }: CalendarViewProps) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const getTasksForDay = (day: number) => {
    return tasks.filter(task => {
      if (!task.suggested_deadline) return false;
      const d = new Date(task.suggested_deadline);
      return d.getDate() === day &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear;
    });
  };

  const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: daysInPrevMonth - firstDay + i + 1, current: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, current: true });
  }
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, current: false });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all"
        >
          ←
        </button>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">{MONTHS[currentMonth]} {currentYear}</h3>
          <button
            onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }}
            className="text-xs text-gray-500 hover:text-gray-300 mt-0.5 transition-all"
          >
            Back to today
          </button>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all"
        >
          →
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs text-gray-500 font-medium py-2">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          const dayTasks = cell.current ? getTasksForDay(cell.day) : [];
          const isToday = cell.current &&
            cell.day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
          const isSelected = cell.current && selectedDay === cell.day;

          return (
            <div
              key={i}
              onClick={() => cell.current && setSelectedDay(cell.day === selectedDay ? null : cell.day)}
              className={`
                min-h-16 p-1.5 rounded-lg border transition-all cursor-pointer
                ${!cell.current ? "opacity-20 cursor-default border-transparent" : ""}
                ${isToday ? "border-blue-500 bg-blue-950" : cell.current ? "border-gray-800 hover:border-gray-600 bg-gray-900" : "border-transparent"}
                ${isSelected ? "border-purple-500 bg-purple-950" : ""}
              `}
            >
              <p className={`text-xs font-medium mb-1 ${isToday ? "text-blue-400" : "text-gray-400"}`}>
                {cell.day}
              </p>
              {dayTasks.slice(0, 2).map(task => (
                <div
                  key={task.id}
                  className={`text-xs px-1 py-0.5 rounded mb-0.5 truncate border ${priorityColor[task.priority_level]}`}
                >
                  {task.task_title}
                </div>
              ))}
              {dayTasks.length > 2 && (
                <p className="text-xs text-gray-500">+{dayTasks.length - 2} more</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected day tasks */}
      {selectedDay && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h4 className="text-sm font-medium text-white mb-3">
            📅 {MONTHS[currentMonth]} {selectedDay}, {currentYear}
            {selectedTasks.length === 0 && <span className="text-gray-500 font-normal ml-2">— No tasks</span>}
          </h4>
          {selectedTasks.map(task => (
            <div key={task.id} className={`p-3 rounded-lg border mb-2 ${priorityColor[task.priority_level]}`}>
              <p className="text-sm font-medium">{task.task_title}</p>
              <p className="text-xs opacity-70 mt-1">{task.quick_win}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs opacity-60">⏱ {task.estimated_total_minutes} min</span>
                <span className="text-xs opacity-60">🎯 Score: {task.priority_score}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Month summary */}
      <div className="grid grid-cols-3 gap-3">
        {(["high", "medium", "low"] as const).map(level => {
          const count = tasks.filter(t => {
            if (!t.suggested_deadline) return false;
            const d = new Date(t.suggested_deadline);
            return d.getMonth() === currentMonth &&
              d.getFullYear() === currentYear &&
              t.priority_level === level;
          }).length;
          return (
            <div key={level} className={`p-3 rounded-xl border text-center ${priorityColor[level]}`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs opacity-70 capitalize">{level} priority</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};