'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import type { SparklineChartProps } from './SparklineChart';

const SparklineChart = dynamic(() => import('./SparklineChart'), {
  ssr: false,
  loading: () => <div className="h-[120px] w-full rounded-md bg-zinc-100 dark:bg-zinc-800 animate-pulse" aria-label="Loading chart" />,
});

export default function Sparkline(props: SparklineChartProps) {
  return <SparklineChart {...props} />;
}
