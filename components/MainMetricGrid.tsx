"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { MainGridRow, DEFAULT_TIMEFRAMES, MetricCode, getMockMainGridData } from "../lib/mockData";

interface MainMetricGridProps {
  metric: MetricCode; // 'R' | 'C' | 'A'
  metricLabel: string; // Human label like Rumination/Compulsions/Avoidance
}

// Utility: format YYYY-MM-DD to "Mon D" (e.g., Sep 17)
function formatShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function MainMetricGrid({ metric, metricLabel }: MainMetricGridProps) {
  const data: MainGridRow[] = useMemo(() => getMockMainGridData(metric), [metric]);
  const router = useRouter();

  return (
    <div className="mt-4 w-full overflow-x-auto">
      <table className="min-w-full border-collapse text-sm" aria-label={`Main metric grid for ${metricLabel}`}>
        <caption className="px-3 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {metricLabel} Tracker
        </caption>
        <thead>
          <tr className="bg-neutral-100 dark:bg-neutral-800">
            <th scope="col" className="sticky left-0 z-10 bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-left font-medium">Date</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">{`Total ${metricLabel}`}</th>
            {DEFAULT_TIMEFRAMES.map(label => (
              <th key={label} scope="col" className="px-3 py-2 text-center font-medium whitespace-nowrap">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={2 + DEFAULT_TIMEFRAMES.length} className="px-3 py-6 text-center text-neutral-500">
                No data yet.
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={row.date}
                className="cursor-pointer odd:bg-neutral-50 dark:odd:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:bg-neutral-100 dark:focus:bg-neutral-800"
                tabIndex={0}
                role="link"
                aria-label={`View day details for ${formatShort(row.date)}`}
                onClick={() => router.push(`/day/${row.date}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/day/${row.date}`);
                  }
                }}
              >
                <th scope="row" className="sticky left-0 z-10 bg-inherit px-3 py-2 text-left font-medium whitespace-nowrap">
                  {formatShort(row.date)}
                </th>
                <td className="px-3 py-2 text-right font-medium tabular-nums">{row.total}</td>
                {DEFAULT_TIMEFRAMES.map(tf => (
                  <td key={tf} className="px-3 py-2 text-right tabular-nums">{row.timeframes[tf]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
