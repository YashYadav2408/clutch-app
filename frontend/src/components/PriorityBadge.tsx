interface PriorityBadgeProps {
  level: "high" | "medium" | "low";
  score?: number;
}

const config = {
  high: { color: "bg-red-900 text-red-300 border-red-700", label: "🔴 High", dot: "bg-red-400" },
  medium: { color: "bg-amber-900 text-amber-300 border-amber-700", label: "🟡 Medium", dot: "bg-amber-400" },
  low: { color: "bg-green-900 text-green-300 border-green-700", label: "🟢 Low", dot: "bg-green-400" },
};

export const PriorityBadge = ({ level, score }: PriorityBadgeProps) => {
  const { color, label, dot } = config[level];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
      {score !== undefined && <span className="opacity-60">({score})</span>}
    </span>
  );
};