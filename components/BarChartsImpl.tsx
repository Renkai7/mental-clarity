'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_COLORS, chartTextColor, chartGridColor } from '@/lib/chartConfig';

export interface BarChartsImplProps {
  data: { blockLabel: string; average: number }[];
  metric: 'R' | 'C' | 'A';
  height?: number;
}

export default function BarChartsImpl({ data, metric, height = 260 }: BarChartsImplProps) {
  // Use orange/amber gradient colors for Cinematic Ember theme
  const color = metric === 'R' ? '#ea580c' : metric === 'C' ? '#f59e0b' : '#fb923c'; // orange-600, amber-500, orange-400
  const text = '#94a3b8'; // slate-400
  const grid = '#27272a'; // cinematic-800

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 28, left: 8 }}>
          <XAxis dataKey="blockLabel" tick={{ fill: text, fontSize: 12 }} axisLine={{ stroke: grid }} tickLine={{ stroke: grid }} interval={0} angle={-20} height={70} dy={8} />
          <YAxis tick={{ fill: text, fontSize: 12 }} axisLine={{ stroke: grid }} tickLine={{ stroke: grid }} allowDecimals={false} />
          <Tooltip
            formatter={(val: number | string) => [String(val), metric === 'R' ? 'Rumination' : metric === 'C' ? 'Compulsions' : 'Avoidance']}
            contentStyle={{ backgroundColor: 'oklch(0.12 0 0 / 0.95)', border: '1px solid oklch(0.16 0 0)', borderRadius: '8px', color: '#fff', boxShadow: '0 0 20px oklch(0.70 0.20 45 / 0.3)' }}
            labelStyle={{ color: '#fff' }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Bar dataKey="average" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
