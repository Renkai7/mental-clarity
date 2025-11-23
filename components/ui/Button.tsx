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
  "border border-border",
  "bg-surface text-text",
  "hover:bg-surface-muted",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
  "disabled:opacity-60 disabled:pointer-events-none",
].join(" ");

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: [
    "bg-[--primary] text-[--primary-foreground]",
    "hover:bg-[color-mix(in_oklab,var(--primary),black_10%)]",
    "border-transparent",
  ].join(" "),
  subtle: "",
  ghost: [
    "border-transparent",
    "bg-transparent",
    "hover:bg-surface-muted",
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
