'use client';

import { useCallback, useRef } from 'react';

export type MetricTab = 'R' | 'C' | 'A';

interface TabsProps {
  activeTab: MetricTab;
  onTabChange: (tab: MetricTab) => void;
  className?: string;
}

const TAB_ORDER: MetricTab[] = ['R', 'C', 'A'];
const LABELS: Record<MetricTab, string> = {
  R: 'Rumination',
  C: 'Compulsions',
  A: 'Avoidance',
};

export default function Tabs({ activeTab, onTabChange, className = '' }: TabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = TAB_ORDER.indexOf(activeTab);
      if (currentIndex === -1) return;
      let nextIndex = currentIndex;
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % TAB_ORDER.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = TAB_ORDER.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      const nextTab = TAB_ORDER[nextIndex];
      onTabChange(nextTab);
      const btn = tabRefs.current[nextIndex];
      btn?.focus();
    },
    [activeTab, onTabChange]
  );

  return (
    <div
      role="tablist"
      aria-label="Metric selection"
      onKeyDown={handleKey}
      className={`flex w-full gap-2 ${className}`}
    >
      {TAB_ORDER.map((tab, i) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab}`}
            tabIndex={isActive ? 0 : -1}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-clarity-medium
              ${
                isActive
                  ? 'border-clarity-high bg-clarity-high/10 text-zinc-900 dark:text-zinc-100'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-black dark:text-zinc-300 dark:hover:bg-zinc-900'
              }`}
          >
            {LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
}
