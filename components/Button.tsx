import clsx from "clsx";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "danger" | "secondary";
  size?: "sm" | "md";
}

const VAR = {
  primary:   "bg-blue-600 text-white hover:bg-blue-700",
  success:   "bg-green-600 text-white hover:bg-green-700",
  danger:    "bg-red-600 text-white hover:bg-red-700",
  secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
};
const SIZE = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export default function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        VAR[variant],
        SIZE[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
