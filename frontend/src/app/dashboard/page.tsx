"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { TaskCard } from "@/components/TaskCard";
import { AIChat } from "@/components/AIChat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarView } from "@/components/CalendarView";
import { getNudge } from "@/lib/api";


export default function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { tasks, loading, adding, stats, addTask, completeTask, removeTask, prioritize, updateSubtaskStatus } = useTasks(user?.email || null);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState<"dark" | "midnight" | "slate" | "forest">("dark");
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);

const themeConfig = {
  dark: { bg: "bg-gray-950", sidebar: "bg-gray-900", card: "bg-gray-900", border: "border-gray-800", accent: "bg-gray-700" },
  midnight: { bg: "bg-slate-950", sidebar: "bg-slate-900", card: "bg-slate-900", border: "border-slate-800", accent: "bg-slate-700" },
  slate: { bg: "bg-zinc-950", sidebar: "bg-zinc-900", card: "bg-zinc-900", border: "border-zinc-800", accent: "bg-zinc-700" },
  forest: { bg: "bg-emerald-950", sidebar: "bg-emerald-900", card: "bg-emerald-900", border: "border-emerald-800", accent: "bg-emerald-800" },
};

const t = themeConfig[theme];

  if (loading) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">⚡</p>
        <p className="text-white font-medium">Loading Clutch...</p>
        <p className="text-gray-500 text-sm mt-1">Getting your tasks ready</p>
      </div>
    </div>
  );
}

if (!user) {
  router.push("/");
  return null;
}


  const filteredTasks = tasks.filter(t => {
    if (filter === "all") return !t.completed;
    return t.priority_level === filter && !t.completed;
  });

  const completedTasks = tasks.filter(t => t.completed);

  const fetchNudge = async () => {
  const urgentTask = tasks.find(t => !t.completed && t.priority_level === "high");
  if (!urgentTask || !urgentTask.suggested_deadline) return;
  const diff = new Date(urgentTask.suggested_deadline).getTime() - new Date().getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const res = await getNudge(urgentTask.task_title, urgentTask.suggested_deadline, `${hours} hours`) as any;
  if (res.success) setNudgeMessage(res.data?.message);
};

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };


  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">⚡ Clutch</h1>
          <p className="text-xs text-gray-500 mt-1">Perform when it counts</p>
        </div>

        <nav className="flex-1 space-y-1">
          {[
              { label: "Dashboard", icon: "🏠", tab: "dashboard" },
              { label: "Calendar", icon: "📅", tab: "calendar" },
              { label: "Goals", icon: "🎯", tab: "goals" },
              { label: "Settings", icon: "⚙️", tab: "settings" },
            ].map(item => (
              <div
                key={item.label}
                onClick={() => setActiveTab(item.tab)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-all ${
                  activeTab === item.tab
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
))}
        </nav>

        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user.photoURL || "/avatar.png"}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
           <Button
            onClick={signOut}
              variant="ghost"
              className="w-full text-gray-400 hover:text-gray-300 hover:bg-gray-800 text-xs"
              >
              Sign out
            </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
  <div className="flex items-center justify-between">
    <div>
      <h2 className="text-xl font-semibold">
        {greeting()}, {user.displayName?.split(" ")[0]} 👋
      </h2>
      <p className="text-gray-400 text-xs mt-0.5">
        {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={fetchNudge}
        className="text-xs text-gray-400 hover:text-purple-300 bg-gray-800 hover:bg-purple-950 px-3 py-2 rounded-lg transition-all border border-gray-700 hover:border-purple-700 flex items-center gap-1.5"
      >
        🧠 <span>AI Nudge</span>
      </button>
      <button
        onClick={async () => {
          setLoadingBriefing(true);
          try {
            const highTasks = tasks
              .filter(t => !t.completed)
              .slice(0, 3)
              .map(t => t.task_title)
              .join(", ");
            const res = await fetch("http://localhost:8000/agent/briefing", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_name: user?.displayName,
                tasks: highTasks
              })
            });
            const data = await res.json();
            setBriefing(data.briefing);
          } catch (e) {
            console.error(e);
          } finally {
            setLoadingBriefing(false);
          }
        }}
        className="text-xs text-gray-400 hover:text-blue-300 bg-gray-800 hover:bg-blue-950 px-3 py-2 rounded-lg transition-all border border-gray-700 hover:border-blue-700 flex items-center gap-1.5"
      >
        {loadingBriefing ? "⏳" : "✨"} <span>{loadingBriefing ? "Generating..." : "Daily Briefing"}</span>
      </button>
    </div>
  </div>
</div>

        {nudgeMessage && activeTab === "dashboard" && (
          <div className="mx-6 mt-4 p-3 bg-purple-950 border border-purple-800 rounded-xl flex items-start gap-3">
          <span className="text-lg">🧠</span>
          <div className="flex-1">
            <p className="text-xs text-purple-400 font-medium mb-0.5">Clutch Nudge</p>
            <p className="text-sm text-purple-200">{nudgeMessage}</p>
          </div>

          <button
            onClick={() => setNudgeMessage(null)}
            className="text-purple-600 hover:text-purple-400 text-xs"
          >
      ✕
    </button>
  </div>
)}

        {briefing && activeTab === "dashboard" && (
  <div className="mx-6 mt-2 p-3 bg-blue-950 border border-blue-800 rounded-xl flex items-start gap-3">
    <span className="text-lg">📋</span>
    <div className="flex-1">
      <p className="text-xs text-blue-400 font-medium mb-0.5">Your Daily Briefing</p>
      <p className="text-sm text-blue-200">{briefing}</p>
    </div>
    <button
      onClick={() => setBriefing(null)}
      className="text-blue-600 hover:text-blue-400 text-xs"
    >
      ✕
    </button>
  </div>
)}

        <div className="flex-1 overflow-y-auto p-6">
  {activeTab === "dashboard" && (
    <>
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-4">
  {[
    { label: "Total Tasks", value: stats.total, color: "text-blue-400" },
    { label: "High Priority", value: stats.high_priority, color: "text-red-400" },
    { label: "Overdue", value: stats.overdue, color: "text-amber-400" },
    { label: "Completed", value: stats.completed, color: "text-green-400" },
  ].map(stat => (
    <Card key={stat.label} className="bg-gray-900 border-gray-800 p-3">
      <p className="text-gray-400 text-xs mb-0.5">{stat.label}</p>
      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
    </Card>
  ))}
  <Card className="bg-gradient-to-br from-purple-950 to-blue-950 border-purple-800 p-3">
    <p className="text-gray-400 text-xs mb-0.5">Productivity Score</p>
    <p className="text-2xl font-bold text-purple-400">
      {stats.total > 0
  ? Math.round(
      ((stats.completed / stats.total) * 40) +
      (stats.high_priority > 0 ? Math.min(30, stats.high_priority * 10) : 30) +
      (stats.overdue === 0 ? 30 : Math.max(0, 30 - stats.overdue * 8))
    )
  : 0}
    </p>
    <p className="text-xs text-purple-600">out of 100</p>
  </Card>
</div>

          

      {/* Filter + Prioritize */}
      <div className="flex items-center gap-2 mb-4">
        {(["all", "high", "medium", "low"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
              filter === f
                ? "bg-white text-black"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
        <button
          onClick={prioritize}
          className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-purple-900 text-purple-300 hover:bg-purple-800"
        >
          🧠 AI Prioritize
        </button>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading your tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-4xl mb-3">✨</p>
          <p>No tasks yet. Add one below!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => (
           <TaskCard
              key={task.id}
              task={task}
              onComplete={() => completeTask(task.id)}
              onDelete={() => removeTask(task.id)}
              onUpdateSubtask={updateSubtaskStatus}
/>
          ))}
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="mt-8">
          <p className="text-gray-500 text-sm mb-3">Completed ({completedTasks.length})</p>
          <div className="space-y-2 opacity-50">
            {completedTasks.map(task => (
             <TaskCard
                key={task.id}
                task={task}
                onComplete={() => completeTask(task.id)}
                onDelete={() => removeTask(task.id)}
                onUpdateSubtask={updateSubtaskStatus}
/>
            ))}
          </div>
        </div>
      )}
    </>
  )}

  {activeTab === "calendar" && (
    <div>
      <h2 className="text-xl font-semibold mb-4">📅 Calendar View</h2>
      <CalendarView tasks={tasks} />
    </div>
  )}

  {activeTab === "goals" && (
  <div>
    <h2 className="text-xl font-semibold mb-2">🎯 Goals & Progress</h2>
    <p className="text-gray-500 text-sm mb-6">Track how your tasks are progressing toward completion</p>

    {/* Overall stats */}
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center hover:border-gray-600 transition-all">
        <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
        <p className="text-xs text-gray-400 mt-1">Total Goals</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center hover:border-gray-600 transition-all">
        <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
        <p className="text-xs text-gray-400 mt-1">Completed</p>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center hover:border-gray-600 transition-all">
        <p className="text-3xl font-bold text-purple-400">
          {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
        </p>
        <p className="text-xs text-gray-400 mt-1">Success Rate</p>
      </div>
    </div>

    {/* Task goals list */}
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">🎯</p>
          <p>No goals yet. Add tasks to track them here!</p>
        </div>
      ) : (
        tasks.map(task => {
          const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
          const totalSubtasks = task.subtasks?.length || 1;
          const subtaskProgress = Math.round((completedSubtasks / totalSubtasks) * 100);
          const scoreBreakdown = [
            { label: "Urgency", value: task.priority_score > 74 ? 40 : task.priority_score > 39 ? 25 : 10, max: 40, color: "bg-red-500" },
            { label: "Impact", value: task.priority_score > 74 ? 35 : task.priority_score > 39 ? 20 : 8, max: 35, color: "bg-blue-500" },
            { label: "Effort", value: task.priority_score > 74 ? 25 : task.priority_score > 39 ? 15 : 6, max: 25, color: "bg-purple-500" },
          ];

          return (
            <div
              key={task.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${task.priority_level === "high" ? "bg-red-400" : task.priority_level === "medium" ? "bg-amber-400" : "bg-green-400"}`} />
                    <p className={`font-medium text-sm ${task.completed ? "line-through text-gray-500" : "text-white"}`}>
                      {task.task_title}
                    </p>
                  </div>
                  {task.reasoning && (
                    <p className="text-xs text-gray-500 mt-1 ml-4">{task.reasoning}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-white">{task.priority_score}</p>
                  <p className="text-xs text-gray-500">priority score</p>
                </div>
              </div>

              {/* Score breakdown */}
              <div className="mb-3 space-y-1.5">
                <p className="text-xs text-gray-500 mb-2">Score breakdown:</p>
                {scoreBreakdown.map(item => (
                  <div key={item.label} className="flex items-center gap-2">
                    <p className="text-xs text-gray-400 w-12">{item.label}</p>
                    <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                      <div
                        className={`${item.color} h-1.5 rounded-full transition-all`}
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 w-8 text-right">{item.value}/{item.max}</p>
                  </div>
                ))}
              </div>

              {/* Subtask progress */}
              {task.subtasks?.length > 0 && (
                <div>
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-gray-500">Subtask progress</p>
                    <p className="text-xs text-gray-400">{completedSubtasks}/{totalSubtasks}</p>
                  </div>
                  <div className="bg-gray-800 rounded-full h-1.5">
                    <div
                      className="bg-green-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${subtaskProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Quick win */}
              {task.quick_win && (
                <div className="mt-3 bg-gray-800 rounded-lg p-2 group-hover:bg-gray-750 transition-all">
                  <p className="text-xs text-gray-400">⚡ Quick win: <span className="text-gray-300">{task.quick_win}</span></p>
                </div>
              )}

              {/* Deadline */}
              {task.suggested_deadline && (
                <div className="mt-2 flex items-center gap-1">
                  <p className="text-xs text-gray-500">📅 Due: {new Date(task.suggested_deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  </div>
)}

 {activeTab === "settings" && (
  <div className="max-w-2xl space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-white">⚙️ Settings</h2>
      <p className="text-gray-500 text-sm mt-1">Manage your account, preferences and notifications</p>
    </div>

    {/* Profile */}
    <div className={`${t.card} border ${t.border} rounded-xl p-5 hover:border-gray-600 transition-all`}>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">👤 Profile</p>
      <div className="flex items-center gap-4 mb-4">
        <img
          src={user?.photoURL || "/avatar.png"}
          alt="avatar"
          className="w-16 h-16 rounded-full border-2 border-gray-700"
        />
        <div>
          <p className="text-white font-semibold text-lg">{user?.displayName}</p>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full mt-1 inline-block">Google Account</span>
        </div>
      </div>
    </div>

    {/* Theme */}
    <div className={`${t.card} border ${t.border} rounded-xl p-5 hover:border-gray-600 transition-all`}>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">🎨 Appearance</p>
      <p className="text-sm text-gray-300 mb-3">Theme</p>
      <div className="grid grid-cols-4 gap-3">
        {([
          { key: "dark", label: "Dark", preview: "bg-gray-900", dot: "bg-gray-600" },
          { key: "midnight", label: "Midnight", preview: "bg-slate-900", dot: "bg-slate-500" },
          { key: "slate", label: "Slate", preview: "bg-zinc-900", dot: "bg-zinc-500" },
          { key: "forest", label: "Forest", preview: "bg-emerald-950", dot: "bg-emerald-600" },
        ] as const).map(th => (
          <button
            key={th.key}
            onClick={() => setTheme(th.key)}
            className={`p-3 rounded-xl border-2 transition-all ${
              theme === th.key ? "border-white" : "border-gray-700 hover:border-gray-500"
            }`}
          >
            <div className={`${th.preview} rounded-lg h-10 w-full mb-2 flex items-center justify-center gap-1`}>
              <div className={`w-2 h-2 rounded-full ${th.dot}`} />
              <div className={`w-4 h-1.5 rounded ${th.dot} opacity-60`} />
            </div>
            <p className="text-xs text-gray-300 text-center">{th.label}</p>
            {theme === th.key && <p className="text-xs text-white text-center mt-0.5">✓ Active</p>}
          </button>
        ))}
      </div>
    </div>

    {/* Notifications */}
    <div className={`${t.card} border ${t.border} rounded-xl p-5 hover:border-gray-600 transition-all`}>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">🔔 Notifications</p>
      <div className="space-y-4">
        {[
          { label: "Daily Briefing", desc: "Get an AI-generated summary of your day every morning", key: "dailyBriefing" },
          { label: "Deadline Nudges", desc: "Get reminders when tasks are approaching their deadline", key: "nudges" },
          { label: "Completion Celebrations", desc: "Show a celebration when you complete all subtasks", key: "celebrations" },
          { label: "Weekly Report", desc: "Receive a weekly productivity summary every Sunday", key: "weeklyReport" },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
            <div>
              <p className="text-sm text-white">{item.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
            <button
              className="w-10 h-6 rounded-full bg-blue-600 flex items-center px-1 transition-all hover:bg-blue-500"
            >
              <div className="w-4 h-4 bg-white rounded-full ml-auto" />
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Productivity preferences */}
    <div className={`${t.card} border ${t.border} rounded-xl p-5 hover:border-gray-600 transition-all`}>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">⚡ Productivity Preferences</p>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-white mb-2">Work hours</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Start time</p>
              <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                {["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM"].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">End time</p>
              <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                {["5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM", "9:00 PM", "10:00 PM"].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-white mb-2">Default task priority</p>
          <div className="flex gap-2">
            {(["high", "medium", "low"] as const).map(p => (
              <button
                key={p}
                className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                  p === "medium"
                    ? "border-amber-500 bg-amber-950 text-amber-300"
                    : "border-gray-700 text-gray-400 hover:border-gray-500"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <p className="text-sm text-white">Focus session duration</p>
            <p className="text-sm text-blue-400">25 minutes</p>
          </div>
          <input
            type="range"
            min="15"
            max="90"
            defaultValue="25"
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>15 min</span>
            <span>90 min</span>
          </div>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className={`${t.card} border ${t.border} rounded-xl p-5 hover:border-gray-600 transition-all`}>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">📊 Your Productivity Stats</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Tasks Created", value: stats.total, icon: "📝", color: "text-blue-400" },
          { label: "Completed", value: stats.completed, icon: "✅", color: "text-green-400" },
          { label: "High Priority", value: stats.high_priority, icon: "🔴", color: "text-red-400" },
          { label: "Overdue", value: stats.overdue, icon: "⚠️", color: "text-amber-400" },
          { label: "Success Rate", value: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`, icon: "🎯", color: "text-purple-400" },
          { label: "Active Tasks", value: stats.total - stats.completed, icon: "⚡", color: "text-cyan-400" },
        ].map(s => (
          <div key={s.label} className="bg-gray-800 rounded-xl p-3 hover:bg-gray-750 transition-all">
            <p className="text-lg">{s.icon}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Danger zone */}
    <div className="border border-red-900 rounded-xl p-5">
      <p className="text-xs text-red-500 uppercase tracking-wider mb-4">⚠️ Danger Zone</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white">Sign out</p>
          <p className="text-xs text-gray-500">You will need to sign in again to access Clutch</p>
        </div>
        <button
          onClick={signOut}
          className="px-4 py-2 rounded-lg border border-red-700 text-red-400 hover:bg-red-950 hover:text-red-300 transition-all text-sm"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
)}
</div>

        {/* AI Chat at bottom */}
        {activeTab === "dashboard" && (
            <div className="border-t border-gray-800 p-4">
            <AIChat onSubmit={addTask} loading={adding} />
            </div>
          )}
      </div>
    </div>
  );
}