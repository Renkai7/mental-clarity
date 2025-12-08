'use client';

import { ReactNode } from 'react';
import BackgroundEffects from './BackgroundEffects';

interface EmberShellProps {
  children: ReactNode;
  className?: string;
}

/**
 * EmberShell Component
 * 
 * Layout wrapper with cinematic background effects and proper spacing.
 * Use as the root container for Ember-styled pages.
 */
export default function EmberShell({ children, className = '' }: EmberShellProps) {
  return (
    <>
      <BackgroundEffects />
      <div className="min-h-screen p-8 relative">
        {/* Deep cinematic radial gradient base layer */}
        <div 
          className="fixed inset-0 -z-20"
          style={{
            background: `
              radial-gradient(circle at 50% 20%, 
                oklch(0.45 0.15 45 / 0.3) 0%, 
                oklch(0.25 0.10 45 / 0.15) 25%,
                oklch(0.15 0.05 45 / 0.05) 50%,
                transparent 80%
              ),
              radial-gradient(circle at 80% 70%, 
                oklch(0.48 0.13 60 / 0.25) 0%, 
                oklch(0.25 0.08 60 / 0.10) 30%,
                transparent 60%
              ),
              linear-gradient(180deg, 
                oklch(0.15 0.02 280) 0%, 
                oklch(0.10 0.01 280) 50%,
                oklch(0.08 0.01 280) 100%
              )
            `
          }}
        />
        <div className={`max-w-7xl mx-auto space-y-12 relative z-10 ${className}`}>
          {children}
        </div>
      </div>
    </>
  );
}
