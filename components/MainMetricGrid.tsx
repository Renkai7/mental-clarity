"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { upsertEntry, getEntry } from '@/lib/dbUtils';
import { makeEntryId } from '@/lib/id';
import Button from "./ui/Button";
import Input from "./ui/Input";

export type MainGridRow = {
  date: string;
  total: number;
  timeframes: Record<string, number>; // key: blockId
};

type Column = { id: string; label: string };

interface MainMetricGridProps {
  metric: 'R' | 'C' | 'A';
  metricLabel: string;
  data: MainGridRow[];
  columns: Column[]; // ordered columns derived from configured blocks
}

// Utility: format YYYY-MM-DD to "Mon D" (e.g., Sep 17)
function formatShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getMetricField(metric: 'R'|'C'|'A') {
  return metric === 'R' ? 'ruminationCount' : metric === 'C' ? 'compulsionsCount' : 'avoidanceCount';
}

type CellKey = string; // `${date}:${blockId}`

export default function MainMetricGrid({ metric, metricLabel, data, columns }: MainMetricGridProps) {
  const router = useRouter();
  const field = getMetricField(metric) as 'ruminationCount' | 'compulsionsCount' | 'avoidanceCount';

  // Local rows for optimistic updates
  const [rows, setRows] = useState<MainGridRow[]>(data);
  useEffect(() => setRows(data), [data]);

  // Save status per cell
  const [status, setStatus] = useState<Record<CellKey, 'idle' | 'saving' | 'saved' | 'error'>>({});
  const timers = useRef<Map<CellKey, ReturnType<typeof setTimeout>>>(new Map());

  const setCellValue = (date: string, blockId: string, value: number) => {
    setRows(prev => prev.map(r => r.date === date ? {
      ...r,
      total: r.total - (r.timeframes[blockId] ?? 0) + value,
      timeframes: { ...r.timeframes, [blockId]: value }
    } : r));
  };

  const scheduleSave = (date: string, blockId: string, value: number) => {
    const key: CellKey = `${date}:${blockId}`;
    setStatus(s => ({ ...s, [key]: 'saving' }));

    const existing = timers.current.get(key);
    if (existing) clearTimeout(existing);

    const t = setTimeout(async () => {
      try {
        const existingEntry = await getEntry(date, blockId);
        const base = existingEntry ?? {
          id: makeEntryId(date, blockId),
          date,
          blockId,
          ruminationCount: 0,
          compulsionsCount: 0,
          avoidanceCount: 0,
          anxietyScore: 5,
          stressScore: 5,
          notes: undefined as string | undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const toSave = { ...base, [field]: value } as any;
        await upsertEntry(toSave);
        setStatus(s => ({ ...s, [key]: 'saved' }));
        // Fade saved indicator
        setTimeout(() => {
          setStatus(s => ({ ...s, [key]: 'idle' }));
        }, 800);
      } catch (e: any) {
        console.error('[MainMetricGrid] Save failed', e?.message || e);
        setStatus(s => ({ ...s, [key]: 'error' }));
      }
    }, 500);

    timers.current.set(key, t);
  };

  return (
    <div className="mt-4 w-full overflow-x-auto">
      <table className="min-w-full border-collapse text-xs md:text-sm" aria-label={`Main metric grid for ${metricLabel}`}>
        <caption className="px-3 py-2 text-left text-sm font-medium text-text-muted">
          {metricLabel} Tracker
        </caption>
        <thead>
          <tr className="bg-surface-muted">
            <th scope="col" className="sticky left-0 z-10 bg-surface-muted px-2 py-1.5 md:px-3 md:py-2 text-left font-medium text-text">Date</th>
            <th scope="col" className="px-2 py-1.5 md:px-3 md:py-2 text-right font-medium text-text">{`Total ${metricLabel}`}</th>
            {columns.map(col => (
              <th
                key={col.id}
                scope="col"
                className="px-2 py-1.5 md:px-3 md:py-2 text-center font-medium whitespace-normal leading-tight text-text"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={2 + columns.length} className="px-3 py-6 text-center text-text-muted">
                No data yet. Create your first entry from the Day page.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.date}
                className="cursor-pointer odd:bg-surface/50 hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
                tabIndex={0}
                role="link"
                aria-label={`View day details for ${formatShort(row.date)}`}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('a')) return;
                  router.push(`/day/${encodeURIComponent(row.date)}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/day/${encodeURIComponent(row.date)}`);
                  }
                }}
              >
                <th scope="row" className="sticky left-0 z-10 bg-inherit px-2 py-1.5 md:px-3 md:py-2 text-left font-medium whitespace-nowrap">
                  <Link href={`/day/${encodeURIComponent(row.date)}`} className="block w-full focus:outline-none">
                    {formatShort(row.date)}
                  </Link>
                </th>
                <td className="px-2 py-1.5 md:px-3 md:py-2 text-right font-medium tabular-nums">{row.total}</td>
                {columns.map(col => {
                  const key: CellKey = `${row.date}:${col.id}`;
                  const value = row.timeframes[col.id] ?? 0;
                  const st = status[key] ?? 'idle';
                  return (
                    <td key={col.id} className="px-2 py-1.5 md:px-3 md:py-2 text-right tabular-nums">
                      <div className="flex items-center justify-end gap-1.5 md:gap-2">
                        <Button
                          aria-label={`Decrease ${metricLabel} for ${col.label}`}
                          variant="subtle"
                          size="sm"
                          className="h-8 w-8 px-0 text-[11px] md:text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = Math.max(0, value - 1);
                            setCellValue(row.date, col.id, next);
                            scheduleSave(row.date, col.id, next);
                          }}
                          type="button"
                        >
                          -
                        </Button>
                        <Input
                          aria-label={`${metricLabel} count for ${col.label}`}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          className="w-12 md:w-16 text-right"
                          density="sm"
                          tabularNums
                          value={value}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const v = Math.max(0, Number(e.target.value || 0));
                            setCellValue(row.date, col.id, v);
                            scheduleSave(row.date, col.id, v);
                          }}
                        />
                        <Button
                          aria-label={`Increase ${metricLabel} for ${col.label}`}
                          variant="subtle"
                          size="sm"
                          className="h-8 w-8 px-0 text-[11px] md:text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = value + 1;
                            setCellValue(row.date, col.id, next);
                            scheduleSave(row.date, col.id, next);
                          }}
                          type="button"
                        >
                          +
                        </Button>
                        <span className="w-8 md:w-12 text-left text-[10px] md:text-xs text-text-muted" aria-live="polite">
                          {st === 'saving' ? 'Saving…' : st === 'saved' ? 'Saved' : st === 'error' ? 'Error' : ''}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
