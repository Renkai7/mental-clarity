'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDailyMeta } from '@/lib/dbUtils';
import { isTrackedDay } from '@/lib/statsCalc';

export default function TrackingReminder() {
  const [showReminder, setShowReminder] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkTodayTracking = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const currentHour = new Date().getHours();

        // Only show reminder after 6 PM (18:00)
        if (currentHour < 18) return;

        // Check if already dismissed today
        const dismissedKey = `tracking-reminder-dismissed-${today}`;
        const wasDismissed = localStorage.getItem(dismissedKey) === 'true';
        if (wasDismissed) return;

        // Check if today is tracked
        const meta = await getDailyMeta(today);
        const tracked = isTrackedDay(meta);

        if (!tracked && mounted) {
          setShowReminder(true);
        }
      } catch (error) {
        console.error('[TrackingReminder] Failed to check tracking status', error);
      }
    };

    // Check immediately
    checkTodayTracking();

    // Check every 30 minutes
    const interval = setInterval(checkTodayTracking, 30 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleDismiss = () => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`tracking-reminder-dismissed-${today}`, 'true');
    setDismissed(true);
    setShowReminder(false);
  };

  const handleGoToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    router.push(`/day/${today}`);
    handleDismiss();
  };

  if (!showReminder || dismissed) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-up"
      role="alert"
      aria-live="polite"
    >
      <div className="rounded-lg border border-lumina-orange-500/40 bg-cinematic-900/95 p-4 shadow-glow-orange backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            <svg className="h-6 w-6 text-lumina-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">Don&apos;t forget to track today!</h3>
            <p className="mt-1 text-sm text-slate-300">
              Fill out your daily summary to keep your stats accurate and maintain your streak.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleGoToToday}
                className="rounded-md bg-lumina-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-lumina-orange-600 transition-colors"
              >
                Track Now
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-md border border-cinematic-700 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-cinematic-800 transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
            aria-label="Dismiss reminder"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
