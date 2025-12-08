"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "muted";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs";
  const variants = {
    default: "border-transparent bg-lumina-orange-500/20 text-lumina-orange-400 border-lumina-orange-500/30",
    outline: "border-cinematic-800 text-slate-300",
    muted: "border-transparent bg-cinematic-900/60 text-slate-400",
  } as const;
  return <span className={cn(base, variants[variant], className)} {...props} />;
}

export default Badge;
