import { useCallback, useEffect, useState } from 'react';
import type { HeatmapMetric, HeatmapDayData, HeatmapBlock, HeatmapColor } from '@/lib/mockData';
import type { BlockEntry, DailyMeta, Settings } from '@/types';
import { getEntriesRange, getDailyMetaRange, getSettings } from '@/lib/dbUtils';
import { computeBlockCI } from '@/lib/clarity';
import { colorForCI, colorForCount, getColorMappingConfig } from '@/lib/colorMapping';

const PAGE_SIZE = 30;

export function useHeatmapData(metric: HeatmapMetric) {
  const [days, setDays] = useState<HeatmapDayData[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true); setError(null);
    try {
      const settings: Settings = await getSettings();
      const cfg = await getColorMappingConfig();
      // Determine date range: today going back offset+PAGE_SIZE
      const today = new Date();
      const startIdx = loaded;
      const endIdx = loaded + PAGE_SIZE - 1;
      const rangeDates: string[] = [];
      for (let i = startIdx; i <= endIdx; i++) {
        const d = new Date(today); d.setDate(today.getDate() - i); rangeDates.push(d.toISOString().slice(0,10));
      }
      const endDate = rangeDates[rangeDates.length - 1];
      const startDate = rangeDates[0];
      // Fetch all entries & meta for range
      const entries: BlockEntry[] = await getEntriesRange(endDate, startDate); // range function expects start<=end, we reversed
      const meta: DailyMeta[] = await getDailyMetaRange(endDate, startDate);
      // Group entries by date
      const byDate: Record<string, BlockEntry[]> = {};
      for (const e of entries) { (byDate[e.date] ||= []).push(e); }
      const metaMap: Record<string, DailyMeta> = Object.fromEntries(meta.map(m=>[m.date,m]));
      const settingsBlocks = settings.blocks.slice().sort((a,b)=>a.order-b.order);
      const newDays: HeatmapDayData[] = rangeDates.map(date => {
        const dayEntries = byDate[date] || [];
        const blocks: HeatmapBlock[] = settingsBlocks.map(bc => {
          const entry = dayEntries.find(e=>e.blockId===bc.id);
          if (!entry) return { blockId: bc.label, value: null, color: 'gray' as HeatmapColor };
          if (metric === 'CI') {
            const ci = computeBlockCI(entry, settings.ciWeights, settings.caps);
            return { blockId: bc.label, value: Number(ci.toFixed(2)), color: colorForCI(ci, cfg) as HeatmapColor };
          } else {
            const count = metric === 'R' ? entry.ruminationCount : metric === 'C' ? entry.compulsionsCount : entry.avoidanceCount;
            return { blockId: bc.label, value: count, color: colorForCount(metric, count, cfg) as HeatmapColor };
          }
        });
        return { date, blocks };
      });
      setDays(prev => {
        const existing = new Set(prev.map(d=>d.date));
        const merged = [...prev, ...newDays.filter(d=>!existing.has(d.date))];
        merged.sort((a,b)=> a.date < b.date ? 1 : -1);
        return merged;
      });
      setLoaded(l => l + PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load heatmap data');
    } finally {
      setIsLoading(false);
    }
  }, [metric, loaded, isLoading]);

  // Reset when metric changes
  useEffect(() => { setDays([]); setLoaded(0); }, [metric]);
  useEffect(() => { if (loaded === 0 && !isLoading) void loadMore(); }, [loadMore, loaded, isLoading]);

  return { days, loadMore, canLoadMore: !isLoading, isLoading, error } as const;
}