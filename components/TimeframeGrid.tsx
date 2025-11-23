"use client";

import React from "react";
import TimeframeEntryRow from "./TimeframeEntryRow";

export interface TimeframeEntry {
  blockLabel: string;
  rumination: number;
  compulsions: number;
  avoidance: number;
  anxiety: number;
  stress: number;
  notes: string;
}

interface TimeframeGridProps {
  entries: TimeframeEntry[];
  onEntryChange?: (index: number, entry: TimeframeEntry) => void;
}

export default function TimeframeGrid({
  entries,
  onEntryChange,
}: TimeframeGridProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className="min-w-full border-collapse text-sm"
        aria-label="Timeframe entries grid"
      >
        <thead>
          <tr className="bg-surface-muted">
            <th
              scope="col"
              className="px-3 py-2 text-left font-medium text-text"
            >
              Block
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-center font-medium text-text"
            >
              Rumination
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-center font-medium text-text"
            >
              Compulsions
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-center font-medium text-text"
            >
              Avoidance
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-center font-medium text-text"
            >
              Anxiety
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-center font-medium text-text"
            >
              Stress
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-center font-medium text-text"
            >
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="bg-surface">
          {entries.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-3 py-6 text-center text-neutral-500 dark:text-neutral-400"
              >
                No timeframe entries yet.
              </td>
            </tr>
          ) : (
            entries.map((entry, index) => (
              <TimeframeEntryRow
                key={entry.blockLabel}
                blockLabel={entry.blockLabel}
                rumination={entry.rumination}
                compulsions={entry.compulsions}
                avoidance={entry.avoidance}
                anxiety={entry.anxiety}
                stress={entry.stress}
                notes={entry.notes}
                onRuminationChange={(value) =>
                  onEntryChange?.(index, { ...entry, rumination: value })
                }
                onCompulsionsChange={(value) =>
                  onEntryChange?.(index, { ...entry, compulsions: value })
                }
                onAvoidanceChange={(value) =>
                  onEntryChange?.(index, { ...entry, avoidance: value })
                }
                onAnxietyChange={(value) =>
                  onEntryChange?.(index, { ...entry, anxiety: value })
                }
                onStressChange={(value) =>
                  onEntryChange?.(index, { ...entry, stress: value })
                }
                onNotesChange={(value) =>
                  onEntryChange?.(index, { ...entry, notes: value })
                }
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
