'use client';

import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { chartTextColor } from '@/lib/chartConfig';

export interface SparklineChartProps {
  data: { date: string; value: number }[];
  height?: number;
}

// Format YYYY-MM-DD date string correctly without timezone issues
function formatDateLabel(dateStr: string | number): string {
  if (typeof dateStr !== 'string') return String(dateStr);
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d); // Local date without timezone shift
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function SparklineChart({ data, height = 120 }: SparklineChartProps) {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <XAxis dataKey="date" hide />
          <Line type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={2} dot={false} />
          <Tooltip
            labelFormatter={(label: string | number) => formatDateLabel(label)}
            formatter={(val: number | string) => [`${Math.round(Number(val) * 100)}%`, 'Clarity']}
            contentStyle={{ 
              backgroundColor: 'oklch(0.12 0 0 / 0.95)', 
              border: '1px solid oklch(0.16 0 0)', 
              borderRadius: '8px', 
              color: '#fff', 
              boxShadow: '0 0 20px oklch(0.70 0.20 45 / 0.3)',
              padding: '8px 12px'
            }}
            labelStyle={{ 
              color: 'oklch(0.80 0.15 45)', 
              fontWeight: 600,
              marginBottom: '4px'
            }}
            wrapperStyle={{ outline: 'none' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
