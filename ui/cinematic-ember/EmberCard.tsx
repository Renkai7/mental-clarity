'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EmberCardProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  variant?: 'orange' | 'amber';
  hover?: boolean;
  className?: string;
}

/**
 * EmberCard Component
 * 
 * Glowing card wrapper with glass-morphism and themed shadows.
 * Supports orange or amber accent colors.
 */
export default function EmberCard({ 
  children, 
  title, 
  description, 
  variant = 'orange',
  hover = false,
  className = '' 
}: EmberCardProps) {
  const glowClass = variant === 'orange' ? 'shadow-glow-orange' : 'shadow-glow-amber';
  const glowHoverClass = variant === 'orange' ? 'hover:shadow-glow-orange-lg' : 'hover:shadow-glow-amber-lg';
  const gradientClass = variant === 'orange' 
    ? 'from-lumina-orange-600/10' 
    : 'from-lumina-amber-600/10';
  
  const cardClasses = `
    backdrop-blur-xl bg-cinematic-900/40 border-cinematic-800 border-2 
    ${glowClass} ${hover ? `${glowHoverClass} hover:scale-105` : ''} 
    transition-all duration-300 overflow-hidden relative
    ${className}
  `.trim();
  
  return (
    <Card className={cardClasses}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} to-transparent pointer-events-none`} />
      {(title || description) && (
        <CardHeader className="relative z-10">
          {title && <CardTitle className="text-3xl font-bold text-white">{title}</CardTitle>}
          {description && <CardDescription className="text-slate-400 text-base mt-2">{description}</CardDescription>}
        </CardHeader>
      )}
      {children && (
        <CardContent className="relative z-10">
          {children}
        </CardContent>
      )}
    </Card>
  );
}
