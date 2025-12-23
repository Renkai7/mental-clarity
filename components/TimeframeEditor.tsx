"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";

interface BlockConfig {
  id: string;
  label: string;
  start: string; // HH:mm
  end: string;   // HH:mm
  order: number;
  active: boolean;
}

export interface TimeframeEditorProps {
  block?: BlockConfig;
  existingBlocks: BlockConfig[]; // Used for overlap validation
  onSave: (block: BlockConfig) => void;
  onCancel: () => void;
}

interface ValidationErrors {
  label?: string;
  start?: string;
  end?: string;
  overlap?: string;
}

function parseToMinutes(time: string): number {
  const [h, m] = time.split(":" ).map(Number);
  return h * 60 + m;
}

function validateTimes(start: string, end: string): { start?: string; end?: string } {
  const s = parseToMinutes(start);
  const e = parseToMinutes(end);
  if (isNaN(s)) return { start: "Invalid start time" };
  if (isNaN(e)) return { end: "Invalid end time" };
  if (e <= s) return { end: "End must be after start" };
  return {};
}

function hasOverlap(
  start: string,
  end: string,
  existing: BlockConfig[],
  currentId?: string
): boolean {
  const s = parseToMinutes(start);
  const e = parseToMinutes(end);
  return existing.some((b) => {
    if (currentId && b.id === currentId) return false; // ignore self during edit
    const bs = parseToMinutes(b.start);
    const be = parseToMinutes(b.end);
    // Overlap if interval intersects
    return s < be && e > bs;
  });
}

export const TimeframeEditor: React.FC<TimeframeEditorProps> = ({
  block,
  existingBlocks,
  onSave,
  onCancel,
}) => {
  const [label, setLabel] = useState(block?.label ?? "");
  const [start, setStart] = useState(block?.start ?? "08:00");
  const [end, setEnd] = useState(block?.end ?? "09:00");
  const [active, setActive] = useState(block?.active ?? true);
  const [touched, setTouched] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Focus first input on mount for accessibility
    dialogRef.current?.querySelector<HTMLInputElement>("#tf-label")?.focus();
  }, []);

  const runValidation = useCallback((): ValidationErrors => {
    const errs: ValidationErrors = {};
    if (!label.trim()) errs.label = "Label is required";
    const timeErrs = validateTimes(start, end);
    Object.assign(errs, timeErrs);
    if (!timeErrs.end && !timeErrs.start) {
      if (hasOverlap(start, end, existingBlocks, block?.id)) {
        errs.overlap = "Timeframe overlaps an existing block";
      }
    }
    return errs;
  }, [label, start, end, existingBlocks, block?.id]);

  // Derive errors from current state (only when touched)
  const errors = useMemo(() => {
    if (!touched) return {};
    return runValidation();
  }, [touched, runValidation]);

  function handleSave() {
    setTouched(true);
    const v = runValidation();
    if (Object.keys(v).length > 0) return;
    const newBlock: BlockConfig = {
      id: block?.id ?? crypto.randomUUID(),
      label: label.trim(),
      start,
      end,
      order: block?.order ?? existingBlocks.length,
      active,
    };
    onSave(newBlock);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tf-editor-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-lg border border-cinematic-800 bg-cinematic-950/95 p-5 shadow-glow-orange backdrop-blur-xl"
      >
        <h2
          id="tf-editor-title"
          className="text-lg font-semibold text-white"
        >
          {block ? "Edit Timeframe" : "Add Timeframe"}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Define a labeled tracking window. Avoid overlaps for accurate totals.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="mt-4 space-y-4"
        >
          <div>
            <label
              htmlFor="tf-label"
              className="block text-xs font-medium text-slate-300"
            >
              Label
            </label>
            <input
              id="tf-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 w-full rounded border border-cinematic-800 bg-cinematic-900/60 px-2 py-1 text-sm shadow-sm text-white focus:outline-none focus:border-lumina-orange-500 focus:shadow-glow-orange"
              aria-invalid={!!errors.label}
              aria-describedby={errors.label ? "tf-label-error" : undefined}
            />
            {errors.label && (
              <p
                id="tf-label-error"
                className="mt-1 text-xs text-red-400"
              >
                {errors.label}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="tf-start"
                className="block text-xs font-medium text-slate-300"
              >
                Start
              </label>
              <input
                id="tf-start"
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 w-full rounded border border-cinematic-800 bg-cinematic-900/60 px-2 py-1 text-sm shadow-sm text-white focus:outline-none focus:border-lumina-orange-500 focus:shadow-glow-orange"
                aria-invalid={!!errors.start}
                aria-describedby={errors.start ? "tf-start-error" : undefined}
              />
              {errors.start && (
                <p id="tf-start-error" className="mt-1 text-xs text-red-400">
                  {errors.start}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label
                htmlFor="tf-end"
                className="block text-xs font-medium text-slate-300"
              >
                End
              </label>
              <input
                id="tf-end"
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1 w-full rounded border border-cinematic-800 bg-cinematic-900/60 px-2 py-1 text-sm shadow-sm text-white focus:outline-none focus:border-lumina-orange-500 focus:shadow-glow-orange"
                aria-invalid={!!errors.end}
                aria-describedby={errors.end ? "tf-end-error" : undefined}
              />
              {errors.end && (
                <p id="tf-end-error" className="mt-1 text-xs text-red-400">
                  {errors.end}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="tf-active"
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-cinematic-800 bg-cinematic-900/60 text-lumina-orange-500 focus:ring-lumina-orange-500"
            />
            <label htmlFor="tf-active" className="text-xs font-medium text-slate-300">
              Active
            </label>
          </div>
          {errors.overlap && (
            <p className="text-xs text-red-400" role="alert">
              {errors.overlap}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-cinematic-800 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-cinematic-800/60 focus:outline-none focus:shadow-glow-orange"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-lumina-orange-500 px-3 py-1.5 text-sm font-medium text-white shadow-glow-orange hover:bg-lumina-orange-600 focus:outline-none focus:shadow-glow-orange-lg disabled:opacity-50"
              disabled={Object.keys(errors).length > 0 && touched}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeframeEditor;
