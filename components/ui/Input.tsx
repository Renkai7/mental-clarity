"use client";

import * as React from "react";

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  density?: "sm" | "md" | "lg";
  tabularNums?: boolean;
};

const densityClasses: Record<NonNullable<InputProps["density"]>, string> = {
  sm: "h-8 px-2 text-sm",
  md: "h-9 px-3 text-sm",
  lg: "h-10 px-3 text-base",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    { className = "", density = "sm", tabularNums, type = "text", ...props },
    ref
  ) {
    const classes = [
      "w-full rounded border border-border",
      "bg-surface text-text",
      "placeholder-text-muted",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      densityClasses[density],
      tabularNums ? "tabular-nums" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <input ref={ref} type={type} className={classes} {...props} />;
  }
);

export default Input;
