import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { db } from '@/lib/db';

export type Metric = 'R' | 'C' | 'A';

export type MainGridRow = {
  date: string; // YYYY-MM-DD
  total: number;
  // Map of blockId -> count for the selected metric
  timeframes: Record<string, number>;
};

function getMetricField(metric: Metric): keyof import('@/types').BlockEntry {
  switch (metric) {
    case 'R':
      return 'ruminationCount';
    case 'C':
      return 'compulsionsCount';
    case 'A':
      return 'avoidanceCount';
  }
}

export function useMainGridData(metric: Metric, daysToLoad = 30) {
  const [data, setData] = useState<MainGridRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(daysToLoad);
  const [hasMore, setHasMore] = useState<boolean>(false);

  // Prevent race conditions if metric or limit changes quickly
  const requestId = useRef(0);

  const field = useMemo(() => getMetricField(metric), [metric]);

  const load = useCallback(async (currentLimit: number) => {
    setIsLoading(true);
    setError(null);
    const id = ++requestId.current;
    try {
      // Load all entries ordered by date desc, then aggregate by date.
      // Note: For MVP simplicity we read all and reduce. Can optimize with
      // keyed pagination later if needed.
      const entries = await db.entries.orderBy('date').reverse().toArray();

      // Aggregate per-date per-block
      const byDate: Map<string, Map<string, number>> = new Map();
      for (const e of entries) {
        const d = e.date;
        let blocks = byDate.get(d);
        if (!blocks) {
          blocks = new Map();
          byDate.set(d, blocks);
        }
        const current = blocks.get(e.blockId) ?? 0;
        const inc = (e as any)[field] as number;
        blocks.set(e.blockId, current + (typeof inc === 'number' ? inc : 0));
      }

      // Sort dates desc and take the latest `currentLimit`
      const sortedDates = Array.from(byDate.keys()).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
      const limitedDates = sortedDates.slice(0, currentLimit);

      const rows: MainGridRow[] = limitedDates.map((d) => {
        const blocks = byDate.get(d)!;
        const timeframes: Record<string, number> = {};
        let total = 0;
        for (const [blockId, count] of blocks.entries()) {
          timeframes[blockId] = count;
          total += count;
        }
        return { date: d, total, timeframes };
      });

      if (id === requestId.current) {
        setData(rows);
        setHasMore(sortedDates.length > currentLimit);
      }
    } catch (err: any) {
      if (id === requestId.current) {
        setError(err?.message ?? 'Failed to load data');
      }
    } finally {
      if (id === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [field]);

  useEffect(() => {
    setLimit(daysToLoad);
  }, [daysToLoad]);

  useEffect(() => {
    load(limit);
  }, [load, limit, field]);

  const loadMore = useCallback(() => {
    setLimit((prev) => prev + daysToLoad);
  }, [daysToLoad]);

  return { data, isLoading, error, loadMore, hasMore } as const;
}
