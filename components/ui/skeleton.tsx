"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-cinematic-900/40", className)}
      {...props}
    />
  );
}

export default Skeleton;
