'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmberStatCardProps {
  title: string;
  value: string | number;
  delta?: string;
  deltaPositive?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'orange' | 'amber';
  className?: string;
}

/**
 * EmberStatCard Component
 * 
 * Stat card with icon, large metric value, and optional delta indicator.
 * Includes entrance animation support via motion wrapper.
 */
export default function EmberStatCard({
  title,
  value,
  delta,
  deltaPositive = true,
  icon: Icon,
  variant = 'orange',
  className = ''
}: EmberStatCardProps) {
  const glowClass = variant === 'orange' ? 'shadow-glow-orange' : 'shadow-glow-amber';
  const glowHoverClass = variant === 'orange' ? 'hover:shadow-glow-orange-lg' : 'hover:shadow-glow-amber-lg';
  const gradientClass = variant === 'orange' 
    ? 'from-lumina-orange-600/10' 
    : 'from-lumina-amber-600/10';
  const iconColorClass = variant === 'orange' ? 'text-lumina-orange-500' : 'text-lumina-amber-500';
  
  return (
    <Card className={`
      backdrop-blur-xl bg-cinematic-900/40 border-cinematic-800 border-2 
      ${glowClass} ${glowHoverClass} hover:scale-105 
      transition-all duration-300 cursor-pointer overflow-hidden relative
      ${className}
    `.trim()}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} to-transparent pointer-events-none`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-semibold text-slate-300">
          {title}
        </CardTitle>
        {Icon && <Icon className={`h-6 w-6 ${iconColorClass}`} />}
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-4xl font-extrabold text-white">
          {value}
        </div>
        {delta && (
          <p className={`text-sm mt-2 ${deltaPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {delta}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
