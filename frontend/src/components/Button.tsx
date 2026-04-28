import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-600 disabled:bg-blue-300",
  secondary:
    "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus-visible:ring-blue-600 disabled:text-slate-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 disabled:bg-red-300",
  ghost:
    "text-slate-700 hover:bg-slate-100 focus-visible:ring-blue-600 disabled:text-slate-400",
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}) => (
  <button
    className={[
      "inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed",
      fullWidth ? "w-full" : "",
      variantClasses[variant],
      className,
    ].join(" ")}
    {...props}
  >
    {children}
  </button>
);

export default Button;
