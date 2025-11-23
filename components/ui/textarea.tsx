"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  density?: "sm" | "md" | "lg";
}

const density: Record<NonNullable<TextareaProps["density"]>, string> = {
  sm: "min-h-[2.25rem] px-2 py-1 text-sm",
  md: "min-h-[2.5rem] px-3 py-2 text-sm",
  lg: "min-h-[2.75rem] px-3 py-2 text-base",
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, density: d = "md", ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded border border-border bg-surface text-text placeholder-text-muted",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          density[d],
          className
        )}
        {...props}
      />
    );
  }
);

export default Textarea;
