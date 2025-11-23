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
    <tr className="border-b border-border odd:bg-surface/50 hover:bg-surface-muted focus-within:bg-surface-muted">
      {/* Block Label */}
      <th
        scope="row"
        className="px-3 py-3 text-left font-medium text-text whitespace-nowrap"
      >
        {blockLabel}
      </th>

      {/* Rumination Count */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
              <Button
                aria-label="Decrease rumination"
                onClick={() => handleDecrement(rumination, 0, onRuminationChange)}
                size="sm"
                variant="subtle"
                className="h-7 w-7 px-0"
                tabularNums
                type="button"
              >
                −
              </Button>
              <Input
                type="number"
                value={rumination}
                onChange={(e) =>
                  onRuminationChange?.(clamp(parseInt(e.target.value) || 0, 0, 999))
                }
                className="w-14 text-center"
                tabularNums
                aria-label={`Rumination count for ${blockLabel}`}
                min={0}
              />
              <Button
                aria-label="Increase rumination"
                onClick={() => handleIncrement(rumination, 999, onRuminationChange)}
                size="sm"
                variant="subtle"
                className="h-7 w-7 px-0"
                tabularNums
                type="button"
              >
                +
              </Button>
        </div>
      </td>

      {/* Compulsions Count */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
              <Button
                aria-label="Decrease compulsions"
                onClick={() => handleDecrement(compulsions, 0, onCompulsionsChange)}
                size="sm"
                variant="subtle"
                className="h-7 w-7 px-0"
                tabularNums
                type="button"
              >
                −
              </Button>
              <Input
                type="number"
                value={compulsions}
                onChange={(e) =>
                  onCompulsionsChange?.(clamp(parseInt(e.target.value) || 0, 0, 999))
                }
                className="w-14 text-center"
                tabularNums
                aria-label={`Compulsions count for ${blockLabel}`}
                min={0}
              />
              <Button
                aria-label="Increase compulsions"
                onClick={() => handleIncrement(compulsions, 999, onCompulsionsChange)}
                size="sm"
                variant="subtle"
                className="h-7 w-7 px-0"
                tabularNums
                type="button"
              >
                +
              </Button>
        </div>
      </td>

      {/* Avoidance Count */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
              <Button
                aria-label="Decrease avoidance"
                onClick={() => handleDecrement(avoidance, 0, onAvoidanceChange)}
                size="sm"
                variant="subtle"
                className="h-7 w-7 px-0"
                tabularNums
                type="button"
              >
                −
              </Button>
              <Input
                type="number"
                value={avoidance}
                onChange={(e) =>
                  onAvoidanceChange?.(clamp(parseInt(e.target.value) || 0, 0, 999))
                }
                className="w-14 text-center"
                tabularNums
                aria-label={`Avoidance count for ${blockLabel}`}
                min={0}
              />
              <Button
                aria-label="Increase avoidance"
                onClick={() => handleIncrement(avoidance, 999, onAvoidanceChange)}
                size="sm"
                variant="subtle"
                className="h-7 w-7 px-0"
                tabularNums
                type="button"
              >
                +
              </Button>
        </div>
      </td>

      {/* Anxiety Score (1-10) */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
              <Button
                aria-label="Decrease anxiety score"
                onClick={() => handleScoreDecrement(anxiety, onAnxietyChange)}
                size="sm"
                variant="subtle"
                className="h-7 w-7 px-0"
                tabularNums
                type="button"
              >
                −
              </Button>
              <Input
                type="number"
                value={anxiety}
                onChange={(e) =>
                  onAnxietyChange?.(clamp(parseInt(e.target.value) || 1, 1, 10))
                }
                className="w-14 text-center"
                tabularNums
                aria-label={`Anxiety score for ${blockLabel}`}
                min={1}
                max={10}
              />
              <Button
                aria-label="Increase anxiety score"
                onClick={() => handleScoreIncrement(anxiety, onAnxietyChange)}
                size="sm"
                variant="subtle"
                className="h-7 w-7 px-0"
                tabularNums
                type="button"
              >
                +
              </Button>
        </div>
      </td>

      {/* Stress Score (1-10) */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-center gap-1">
              <Button
                aria-label="Decrease stress score"
                onClick={() => handleScoreDecrement(stress, onStressChange)}
                size="sm"
                variant="subtle"
                className="h-7 w-7 px-0"
                tabularNums
                type="button"
              >
                −
              </Button>
              <Input
                type="number"
                value={stress}
                onChange={(e) =>
                  onStressChange?.(clamp(parseInt(e.target.value) || 1, 1, 10))
                }
                className="w-14 text-center"
                tabularNums
                aria-label={`Stress score for ${blockLabel}`}
                min={1}
                max={10}
              />
              <Button
                aria-label="Increase stress score"
                onClick={() => handleScoreIncrement(stress, onStressChange)}
                size="sm"
                variant="subtle"
                className="h-7 w-7 px-0"
                tabularNums
                type="button"
              >
                +
              </Button>
        </div>
      </td>

      {/* Notes */}
      <td className="px-3 py-3">
            <Input
              type="text"
              value={notes}
              onChange={(e) => onNotesChange?.(e.target.value)}
              placeholder="Notes..."
              className="w-full"
              aria-label={`Notes for ${blockLabel}`}
            />
      </td>
    </tr>
  );
}
