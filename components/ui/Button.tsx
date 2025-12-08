"use client";

import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "subtle" | "ghost";
  size?: "sm" | "md" | "lg";
  tabularNums?: boolean;
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-2 text-sm",
  md: "h-9 px-3 text-sm",
  lg: "h-10 px-4 text-base",
};

const base = [
  "inline-flex items-center justify-center",
  "rounded",
  "border border-cinematic-800",
  "bg-cinematic-900/60 text-white",
  "hover:bg-cinematic-800/60 hover:shadow-glow-orange-sm",
  "focus:outline-none focus-visible:shadow-glow-orange",
  "disabled:opacity-60 disabled:pointer-events-none",
  "transition-all",
  "cursor-pointer",
].join(" ");

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: [
    "bg-lumina-orange-500 text-white",
    "hover:bg-lumina-orange-600",
    "border-transparent",
    "shadow-glow-orange",
    "hover:shadow-glow-orange-lg",
  ].join(" "),
  subtle: "",
  ghost: [
    "border-transparent",
    "bg-transparent",
    "hover:bg-cinematic-900/40",
  ].join(" "),
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className = "", variant = "subtle", size = "sm", tabularNums, ...props },
    ref
  ) {
    const classes = [
      base,
      sizeClasses[size],
      variants[variant],
      tabularNums ? "tabular-nums" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <button ref={ref} className={classes} {...props} />;
  }
);

export default Button;
