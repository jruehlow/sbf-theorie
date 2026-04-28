import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({
  interactive = false,
  className = "",
  children,
  ...props
}) => (
  <div
    className={[
      "rounded-lg border border-slate-200 bg-white shadow-sm",
      interactive
        ? "transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
        : "",
      className,
    ].join(" ")}
    {...props}
  >
    {children}
  </div>
);

export default Card;
