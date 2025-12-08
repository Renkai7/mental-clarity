import { useCallback, useEffect, useState } from 'react';
import { getEntriesRange, getDailyMetaRange, getSettings } from '@/lib/dbUtils';
import type { Settings, Metric } from '@/types';
import { buildDayAggregates, computeKPIs, buildSparkline, buildBlockAverages } from '@/lib/statsCalc';

export interface StatsData {
  kpis: ReturnType<typeof computeKPIs> | null;
  sparkline: { date: string; value: number }[];
  blockAverages: { blockId: string; blockLabel: string; average: number }[];
  isLoading: boolean;
  error: string | null;
  setBarMetric: (m: Metric) => void;
  barMetric: Metric;
}

const RANGE_DAYS = 60; // fetch last 60 days for stats calculations

export function useStatsData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<ReturnType<typeof computeKPIs> | null>(null);
  const [sparkline, setSparkline] = useState<{ date: string; value: number }[]>([]);
  const [blockAverages, setBlockAverages] = useState<{ blockId: string; blockLabel: string; average: number }[]>([]);
  const [barMetric, setBarMetric] = useState<Metric>('R');

  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const today = new Date();
      const dates: string[] = [];
      for (let i=0;i<RANGE_DAYS;i++) { const d=new Date(today); d.setDate(today.getDate()-i); dates.push(d.toISOString().slice(0,10)); }
      const startDate = dates[dates.length-1];
      const endDate = dates[0];
      const [entries, meta, settings] = await Promise.all([
        getEntriesRange(startDate, endDate),
        getDailyMetaRange(startDate, endDate),
        getSettings(),
      ]);
      const aggregates = buildDayAggregates(entries, meta, settings);
      setKpis(computeKPIs(aggregates, settings));
      setSparkline(buildSparkline(aggregates, 'CI', 14));
      const rawBlockAvgs = buildBlockAverages(aggregates, barMetric, 7);
      const labelMap: Record<string, string> = Object.fromEntries(settings.blocks.map(b => [b.id, b.label]));
      setBlockAverages(rawBlockAvgs.map(b => ({ blockId: b.blockId, blockLabel: labelMap[b.blockId] || b.blockId, average: b.average })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  }, [barMetric]);

  useEffect(()=>{ void load(); }, [load]);
  useEffect(()=>{ // recompute block averages when metric changes
    if (kpis){ void load(); }
  }, [barMetric]);

  return { kpis, sparkline, blockAverages, isLoading, error, barMetric, setBarMetric } as StatsData;
}