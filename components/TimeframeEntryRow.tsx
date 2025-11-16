"use client";

import React from "react";

interface TimeframeEntryRowProps {
  blockLabel: string;
  rumination: number;
  compulsions: number;
  avoidance: number;
  anxiety: number;
  stress: number;
  notes: string;
  onRuminationChange?: (value: number) => void;
  onCompulsionsChange?: (value: number) => void;
  onAvoidanceChange?: (value: number) => void;
  onAnxietyChange?: (value: number) => void;
  onStressChange?: (value: number) => void;
  onNotesChange?: (value: string) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function TimeframeEntryRow({
  blockLabel,
  rumination,
  compulsions,
  avoidance,
  anxiety,
  stress,
  notes,
  onRuminationChange,
  onCompulsionsChange,
  onAvoidanceChange,
  onAnxietyChange,
  onStressChange,
  onNotesChange,
}: TimeframeEntryRowProps) {
  const handleIncrement = (
    current: number,
    max: number,
    onChange?: (val: number) => void
  ) => {
    if (onChange) {
      onChange(clamp(current + 1, 0, max));
    }
  };

  const handleDecrement = (
    current: number,
    min: number,
    onChange?: (val: number) => void
  ) => {
    if (onChange) {
      onChange(clamp(current - 1, min, Number.MAX_SAFE_INTEGER));
    }
  };

  const handleScoreIncrement = (
    current: number,
    onChange?: (val: number) => void
  ) => {
    if (onChange) {
      onChange(clamp(current + 1, 1, 10));
    }
  };

  const handleScoreDecrement = (
    current: number,
    onChange?: (val: number) => void
  ) => {
    if (onChange) {
      onChange(clamp(current - 1, 1, 10));
    }
  };

  return (
    <tr className="border-b border-zinc-200 dark:border-zinc-700">
      {/* Block Label */}
      <th
        scope="row"
        className="px-3 py-3 text-left font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap"
      >
        {blockLabel}
      </th>

      {/* Rumination Count */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => handleDecrement(rumination, 0, onRuminationChange)}
            className="h-7 w-7 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Decrease rumination"
          >
            −
          </button>
          <input
            type="number"
            value={rumination}
            onChange={(e) =>
              onRuminationChange?.(clamp(parseInt(e.target.value) || 0, 0, 999))
            }
            className="w-14 rounded border border-zinc-300 bg-white px-2 py-1 text-center text-sm tabular-nums text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Rumination count for ${blockLabel}`}
            min={0}
          />
          <button
            type="button"
            onClick={() => handleIncrement(rumination, 999, onRuminationChange)}
            className="h-7 w-7 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Increase rumination"
          >
            +
          </button>
        </div>
      </td>

      {/* Compulsions Count */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => handleDecrement(compulsions, 0, onCompulsionsChange)}
            className="h-7 w-7 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Decrease compulsions"
          >
            −
          </button>
          <input
            type="number"
            value={compulsions}
            onChange={(e) =>
              onCompulsionsChange?.(clamp(parseInt(e.target.value) || 0, 0, 999))
            }
            className="w-14 rounded border border-zinc-300 bg-white px-2 py-1 text-center text-sm tabular-nums text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Compulsions count for ${blockLabel}`}
            min={0}
          />
          <button
            type="button"
            onClick={() => handleIncrement(compulsions, 999, onCompulsionsChange)}
            className="h-7 w-7 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Increase compulsions"
          >
            +
          </button>
        </div>
      </td>

      {/* Avoidance Count */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => handleDecrement(avoidance, 0, onAvoidanceChange)}
            className="h-7 w-7 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Decrease avoidance"
          >
            −
          </button>
          <input
            type="number"
            value={avoidance}
            onChange={(e) =>
              onAvoidanceChange?.(clamp(parseInt(e.target.value) || 0, 0, 999))
            }
            className="w-14 rounded border border-zinc-300 bg-white px-2 py-1 text-center text-sm tabular-nums text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Avoidance count for ${blockLabel}`}
            min={0}
          />
          <button
            type="button"
            onClick={() => handleIncrement(avoidance, 999, onAvoidanceChange)}
            className="h-7 w-7 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Increase avoidance"
          >
            +
          </button>
        </div>
      </td>

      {/* Anxiety Score (1-10) */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => handleScoreDecrement(anxiety, onAnxietyChange)}
            className="h-7 w-7 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Decrease anxiety score"
          >
            −
          </button>
          <input
            type="number"
            value={anxiety}
            onChange={(e) =>
              onAnxietyChange?.(clamp(parseInt(e.target.value) || 1, 1, 10))
            }
            className="w-14 rounded border border-zinc-300 bg-white px-2 py-1 text-center text-sm tabular-nums text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Anxiety score for ${blockLabel}`}
            min={1}
            max={10}
          />
          <button
            type="button"
            onClick={() => handleScoreIncrement(anxiety, onAnxietyChange)}
            className="h-7 w-7 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Increase anxiety score"
          >
            +
          </button>
        </div>
      </td>

      {/* Stress Score (1-10) */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => handleScoreDecrement(stress, onStressChange)}
            className="h-7 w-7 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Decrease stress score"
          >
            −
          </button>
          <input
            type="number"
            value={stress}
            onChange={(e) =>
              onStressChange?.(clamp(parseInt(e.target.value) || 1, 1, 10))
            }
            className="w-14 rounded border border-zinc-300 bg-white px-2 py-1 text-center text-sm tabular-nums text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`Stress score for ${blockLabel}`}
            min={1}
            max={10}
          />
          <button
            type="button"
            onClick={() => handleScoreIncrement(stress, onStressChange)}
            className="h-7 w-7 rounded border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Increase stress score"
          >
            +
          </button>
        </div>
      </td>

      {/* Notes */}
      <td className="px-3 py-3">
        <input
          type="text"
          value={notes}
          onChange={(e) => onNotesChange?.(e.target.value)}
          placeholder="Notes..."
          className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 placeholder-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Notes for ${blockLabel}`}
        />
      </td>
    </tr>
  );
}
