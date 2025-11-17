"use client";

import React, { useEffect, useRef, useState } from "react";

export interface Goals {
  R: number; // Max Rumination
  C: number; // Max Compulsions
  A: number; // Max Avoidance
  exerciseMinutes: number; // Minimum exercise minutes
  minSleepQuality: number; // Minimum sleep quality (1-10)
}

export interface GoalsConfigProps {
  goals: Goals;
  onSave: (goals: Goals) => void;
  disabled?: boolean;
}

interface FieldError {
  R?: string;
  C?: string;
  A?: string;
  exerciseMinutes?: string;
  minSleepQuality?: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export const GoalsConfig: React.FC<GoalsConfigProps> = ({ goals, onSave, disabled }) => {
  const [local, setLocal] = useState<Goals>(goals);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState(false);
  const firstRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  function validate(g: Goals): FieldError {
    const e: FieldError = {};
    if (g.R < 0) e.R = "Cannot be negative";
    if (g.C < 0) e.C = "Cannot be negative";
    if (g.A < 0) e.A = "Cannot be negative";
    if (g.exerciseMinutes < 0) e.exerciseMinutes = "Cannot be negative";
    if (g.minSleepQuality < 1 || g.minSleepQuality > 10) e.minSleepQuality = "Must be 1–10";
    return e;
  }

  function handleChange<K extends keyof Goals>(key: K, value: number) {
    setTouched(true);
    const updated = { ...local, [key]: value } as Goals;
    setLocal(updated);
    setErrors(validate(updated));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate(local);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    onSave(local);
  }

  const saveDisabled = disabled || (touched && Object.keys(errors).length > 0);

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby="goals-config-title"
      className="space-y-5"
    >
      <div>
        <h3 id="goals-config-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Daily Goals
        </h3>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          These targets help visualize progress and influence derived metrics later.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="goal-r" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Max Rumination
          </label>
          <input
            ref={firstRef}
            id="goal-r"
            type="number"
            min={0}
            value={local.R}
            onChange={(e) => handleChange("R", clamp(Number(e.target.value), 0, 10000))}
            className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-invalid={!!errors.R}
            aria-describedby={errors.R ? "goal-r-error" : undefined}
            disabled={disabled}
          />
          {errors.R && (
            <p id="goal-r-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.R}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="goal-c" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Max Compulsions
          </label>
          <input
            id="goal-c"
            type="number"
            min={0}
            value={local.C}
            onChange={(e) => handleChange("C", clamp(Number(e.target.value), 0, 10000))}
            className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-invalid={!!errors.C}
            aria-describedby={errors.C ? "goal-c-error" : undefined}
            disabled={disabled}
          />
          {errors.C && (
            <p id="goal-c-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.C}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="goal-a" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Max Avoidance
          </label>
          <input
            id="goal-a"
            type="number"
            min={0}
            value={local.A}
            onChange={(e) => handleChange("A", clamp(Number(e.target.value), 0, 10000))}
            className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-invalid={!!errors.A}
            aria-describedby={errors.A ? "goal-a-error" : undefined}
            disabled={disabled}
          />
          {errors.A && (
            <p id="goal-a-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.A}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="goal-ex" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Min Exercise Minutes
          </label>
          <input
            id="goal-ex"
            type="number"
            min={0}
            value={local.exerciseMinutes}
            onChange={(e) => handleChange("exerciseMinutes", clamp(Number(e.target.value), 0, 1440))}
            className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            aria-invalid={!!errors.exerciseMinutes}
            aria-describedby={errors.exerciseMinutes ? "goal-ex-error" : undefined}
            disabled={disabled}
          />
          {errors.exerciseMinutes && (
            <p id="goal-ex-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errors.exerciseMinutes}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="goal-sleep" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Min Sleep Quality (1–10)
          </label>
            <input
              id="goal-sleep"
              type="number"
              min={1}
              max={10}
              value={local.minSleepQuality}
              onChange={(e) => handleChange("minSleepQuality", clamp(Number(e.target.value), 1, 10))}
              className="mt-1 w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              aria-invalid={!!errors.minSleepQuality}
              aria-describedby={errors.minSleepQuality ? "goal-sleep-error" : undefined}
              disabled={disabled}
            />
            {errors.minSleepQuality && (
              <p id="goal-sleep-error" className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.minSleepQuality}
              </p>
            )}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saveDisabled}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring focus:ring-indigo-500 disabled:opacity-50"
        >
          Save Goals
        </button>
      </div>
    </form>
  );
};

export default GoalsConfig;
