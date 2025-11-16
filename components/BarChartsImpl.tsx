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
  const color = metric === 'R' ? CHART_COLORS.rumination : metric === 'C' ? CHART_COLORS.compulsions : CHART_COLORS.avoidance;
  const text = chartTextColor();
  const grid = chartGridColor();

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis dataKey="blockLabel" tick={{ fill: text, fontSize: 12 }} axisLine={{ stroke: grid }} tickLine={{ stroke: grid }} interval={0} angle={-20} height={50} />
          <YAxis tick={{ fill: text, fontSize: 12 }} axisLine={{ stroke: grid }} tickLine={{ stroke: grid }} allowDecimals={false} />
          <Tooltip
            formatter={(val: any) => [String(val), metric === 'R' ? 'Rumination' : metric === 'C' ? 'Compulsions' : 'Avoidance']}
            contentStyle={{ backgroundColor: 'rgba(24,24,27,0.85)', border: 'none', color: '#fff' }}
            labelStyle={{ color: '#fff' }}
            wrapperStyle={{ outline: 'none' }}
          />
          <Bar dataKey="average" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
