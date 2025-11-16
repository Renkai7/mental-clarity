'use client';

import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { chartTextColor } from '@/lib/chartConfig';

export interface SparklineChartProps {
  data: { date: string; value: number }[];
  height?: number;
}

export default function SparklineChart({ data, height = 120 }: SparklineChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
          <Tooltip
            labelFormatter={(label: string | number) => new Date(label).toLocaleDateString()}
            formatter={(val: any) => [`${Math.round((val as number) * 100)}%`, 'Clarity']}
            contentStyle={{ backgroundColor: 'rgba(24,24,27,0.85)', border: 'none', color: '#fff' }}
            labelStyle={{ color: '#fff' }}
            wrapperStyle={{ outline: 'none' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
