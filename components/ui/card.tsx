"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface text-text shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export default Card;
