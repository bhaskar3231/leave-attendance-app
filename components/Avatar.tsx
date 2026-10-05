"use client";

import clsx from "clsx";

interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  online?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

const COLORS = [
  "bg-blue-600",
  "bg-indigo-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-cyan-600",
  "bg-teal-600",
];

function colorForInitials(initials: string): string {
  const code = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
  return COLORS[code % COLORS.length];
}

export default function Avatar({ initials, size = "md", color, online, className }: AvatarProps) {
  const bg = color ?? colorForInitials(initials);
  return (
    <div className={clsx("relative flex-shrink-0", className)}>
      <div
        className={clsx(
          "rounded-full flex items-center justify-center font-bold text-white",
          SIZE_MAP[size],
          bg
        )}
        aria-label={`Avatar for ${initials}`}
      >
        {initials}
      </div>
      {online !== undefined && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 rounded-full border-2 border-white",
            size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3",
            online ? "bg-emerald-500" : "bg-gray-400"
          )}
        />
      )}
    </div>
  );
}
