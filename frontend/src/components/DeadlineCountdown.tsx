"use client";
import { useState, useEffect } from "react";

interface DeadlineCountdownProps {
  deadline: string;
  taskTitle: string;
}

export const DeadlineCountdown = ({ deadline, taskTitle }: DeadlineCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(deadline).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft("Overdue!");
        setUrgent(true);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setUrgent(diff < 1000 * 60 * 60 * 6);
      if (days > 0) setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      else setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };
    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <div className={`rounded-xl p-3 border ${urgent ? "bg-red-950 border-red-800" : "bg-gray-900 border-gray-800"}`}>
      <p className="text-xs text-gray-400 truncate mb-1">⏱ {taskTitle}</p>
      <p className={`text-lg font-bold font-mono ${urgent ? "text-red-400" : "text-white"}`}>
        {timeLeft}
      </p>
    </div>
  );
};