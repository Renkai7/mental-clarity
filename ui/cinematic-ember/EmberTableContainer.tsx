'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EmberTableContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  variant?: 'orange' | 'amber';
  className?: string;
}

/**
 * EmberTableContainer Component
 * 
 * Table wrapper with glowing card style and proper header styling.
 * Use with shadcn/ui Table components.
 */
export default function EmberTableContainer({
  title,
  description,
  children,
  variant = 'orange',
  className = ''
}: EmberTableContainerProps) {
  const glowClass = variant === 'orange' ? 'shadow-glow-orange' : 'shadow-glow-amber';
  const gradientClass = variant === 'orange' 
    ? 'from-lumina-orange-600/5' 
    : 'from-lumina-amber-600/5';
  
  return (
    <Card className={`
      backdrop-blur-xl bg-cinematic-900/40 border-cinematic-800 border-2 
      ${glowClass} overflow-hidden relative
      ${className}
    `.trim()}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} to-transparent pointer-events-none`} />
      <CardHeader className="relative z-10">
        <CardTitle className="text-3xl font-bold text-white">{title}</CardTitle>
        {description && (
          <CardDescription className="text-slate-400 text-base mt-2">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="relative z-10">
        {children}
      </CardContent>
    </Card>
  );
}
