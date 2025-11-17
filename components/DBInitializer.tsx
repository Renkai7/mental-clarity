'use client';

import { useEffect, useState } from 'react';
import { seedDefaultData } from '@/lib/seed';

export default function DBInitializer() {
  const [status, setStatus] = useState<'idle' | 'seeding' | 'done' | 'error'>('idle');

  useEffect(() => {
    let cancelled = false;
    setStatus('seeding');
    seedDefaultData()
      .then(() => {
        if (!cancelled) setStatus('done');
      })
      .catch((e) => {
        console.error('DB initialization failed', e);
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Non-visual initializer; could render subtle status if desired
  return null;
}
