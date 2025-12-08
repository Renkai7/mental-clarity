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
          "w-full rounded border border-cinematic-800 bg-cinematic-900/60 text-white placeholder-slate-500",
          "focus:outline-none focus:border-lumina-orange-500 focus:shadow-glow-orange",
          "transition-all",
          density[d],
          className
        )}
        {...props}
      />
    );
  }
);

export default Textarea;
