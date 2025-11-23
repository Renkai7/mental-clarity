"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "muted";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs";
  const variants = {
    default: "border-transparent bg-[--accent] text-text",
    outline: "border-border text-text",
    muted: "border-transparent bg-surface-muted text-text",
  } as const;
  return <span className={cn(base, variants[variant], className)} {...props} />;
}

export default Badge;
