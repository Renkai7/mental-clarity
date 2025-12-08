'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';

interface EmberCTAButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'orange' | 'amber';
}

/**
 * EmberCTAButton Component
 * 
 * Primary CTA button with gradient and glow effects.
 */
export default function EmberCTAButton({ 
  children, 
  variant = 'orange',
  className = '',
  ...props 
}: EmberCTAButtonProps) {
  const gradientClass = variant === 'orange'
    ? 'from-lumina-orange-600 to-lumina-orange-500'
    : 'from-lumina-amber-600 to-lumina-amber-500';
  
  const shadowClass = variant === 'orange'
    ? 'shadow-glow-orange hover:shadow-glow-orange-lg'
    : 'shadow-glow-amber hover:shadow-glow-amber-lg';
  
  return (
    <button 
      className={`
        px-8 py-4 bg-gradient-to-r ${gradientClass}
        text-white font-semibold rounded-lg 
        ${shadowClass}
        hover:scale-105 hover:brightness-110 
        transition-all duration-200 cursor-pointer
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
