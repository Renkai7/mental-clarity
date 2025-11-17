"use client";

import React from "react";

interface BlockConfig {
  id: string;
  label: string;
  start: string; // HH:mm
  end: string;   // HH:mm
  order: number;
  active: boolean;
}

export interface TimeframeListProps {
  blocks: BlockConfig[];
  onEdit: (block: BlockConfig) => void;
  onDelete: (blockId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

function reorder(blocks: BlockConfig[], from: number, to: number) {
  const copy = [...blocks];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy.map((b, i) => ({ ...b, order: i }));
}

export const TimeframeList: React.FC<TimeframeListProps> = ({
  blocks,
  onEdit,
  onDelete,
  onReorder,
}) => {
  return (
    <div className="space-y-3" aria-label="Configured timeframes">
      {blocks
        .sort((a, b) => a.order - b.order)
        .map((block, index) => {
          return (
            <div
              key={block.id}
              className="flex items-center justify-between rounded border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900"
              role="group"
              aria-label={`${block.label} timeframe row`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                  {block.label}
                  {!block.active && (
                    <span className="ml-2 inline-block rounded bg-zinc-200 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      Inactive
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {block.start} – {block.end}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  type="button"
                  onClick={() => onEdit(block)}
                  className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium hover:bg-zinc-100 focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(block.id)}
                  className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring focus:ring-red-500 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  Delete
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Move timeframe up"
                    disabled={index === 0}
                    onClick={() => onReorder(index, index - 1)}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium disabled:opacity-40 hover:bg-zinc-100 focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move timeframe down"
                    disabled={index === blocks.length - 1}
                    onClick={() => onReorder(index, index + 1)}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs font-medium disabled:opacity-40 hover:bg-zinc-100 focus:outline-none focus:ring focus:ring-indigo-500 dark:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      {blocks.length === 0 && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No timeframes configured yet.</p>
      )}
    </div>
  );
};

export default TimeframeList;
