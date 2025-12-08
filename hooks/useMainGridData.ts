import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMainGridSummary } from '@/lib/dbUtils';

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
      const rows = (await getMainGridSummary(metric, currentLimit)) as MainGridRow[];

      if (id === requestId.current) {
        setData(rows);
        // We can't know total distinct dates without another call; be optimistic
        setHasMore(rows.length >= currentLimit);
      }
    } catch (err) {
      if (id === requestId.current) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      }
    } finally {
      if (id === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [field, metric]);

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
