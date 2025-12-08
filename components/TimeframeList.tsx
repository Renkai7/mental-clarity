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
              className="flex items-center justify-between rounded border border-cinematic-800 bg-cinematic-900/60 px-4 py-3 shadow-sm hover:bg-cinematic-900/80 hover:shadow-glow-orange-sm transition-all"
              role="group"
              aria-label={`${block.label} timeframe row`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-white">
                  {block.label}
                  {!block.active && (
                    <span className="ml-2 inline-block rounded bg-cinematic-800/60 px-2 py-0.5 text-xs font-semibold text-slate-400">
                      Inactive
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {block.start} – {block.end}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  type="button"
                  onClick={() => onEdit(block)}
                  className="rounded border border-cinematic-800 px-2 py-1 text-xs font-medium text-white hover:bg-lumina-orange-500/20 hover:border-lumina-orange-500/30 hover:shadow-glow-orange-sm focus:outline-none focus:shadow-glow-orange transition-all"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(block.id)}
                  className="rounded border border-red-500/30 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:border-red-500/50 focus:outline-none focus:shadow-glow-orange transition-all"
                >
                  Delete
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Move timeframe up"
                    disabled={index === 0}
                    onClick={() => onReorder(index, index - 1)}
                    className="rounded border border-cinematic-800 px-2 py-1 text-xs font-medium text-white disabled:opacity-40 hover:bg-cinematic-800/60 focus:outline-none focus:shadow-glow-orange"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move timeframe down"
                    disabled={index === blocks.length - 1}
                    onClick={() => onReorder(index, index + 1)}
                    className="rounded border border-cinematic-800 px-2 py-1 text-xs font-medium text-white disabled:opacity-40 hover:bg-cinematic-800/60 focus:outline-none focus:shadow-glow-orange"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      {blocks.length === 0 && (
        <p className="text-sm text-slate-400">No timeframes configured yet.</p>
      )}
    </div>
  );
};

export default TimeframeList;
