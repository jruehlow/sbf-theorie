import React from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: "blue" | "green" | "amber";
  className?: string;
}

const toneClasses = {
  blue: "bg-blue-700",
  green: "bg-emerald-600",
  amber: "bg-amber-500",
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  tone = "blue",
  className = "",
}) => {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={`h-2 overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${toneClasses[tone]}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

export default ProgressBar;
