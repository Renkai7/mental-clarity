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
      "w-full rounded border border-cinematic-800",
      "bg-cinematic-900/60 text-white",
      "placeholder-slate-500",
      "focus:outline-none focus:border-lumina-orange-500 focus:shadow-glow-orange",
      "transition-all",
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
