"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

type AppView = 'home' | 'history' | 'stats' | 'settings';

interface NavItem {
  label: string;
  view: AppView;
}

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}
const navItems: NavItem[] = [
  { label: 'Home', view: 'home' },
  { label: 'History', view: 'history' },
  { label: 'Stats', view: 'stats' },
  { label: 'Settings', view: 'settings' },
];

export default function Navbar({ currentView, onNavigate }: NavbarProps) {
  const [isTop, setIsTop] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('[navbar] view changed to', currentView);
  }, [currentView]);

  useEffect(() => {
    const onScroll = () => setIsTop(window.scrollY < 4);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goToToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    router.push(`/day/${encodeURIComponent(today)}`);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        isTop ? 'border-transparent' : 'border-cinematic-800'
      } bg-cinematic-950/90 backdrop-blur-xl shadow-glow-orange`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-white via-lumina-orange-400 to-lumina-amber-400 bg-clip-text text-transparent">
            Mental Clarity
          </span>
          <button
            type="button"
            onClick={goToToday}
            className="rounded-md bg-lumina-orange-500/20 border border-lumina-orange-500/30 px-3 py-1 text-sm font-medium text-lumina-orange-400 hover:bg-lumina-orange-500/30 hover:shadow-glow-orange-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-lumina-orange-500 transition-all cursor-pointer"
            aria-label="Go to today's entry"
            title="Jump to today's tracking page"
          >
            Today
          </button>
        </div>
        <ul className="flex items-center gap-1" role="menubar">
          {navItems.map((item) => {
            const active = currentView === item.view;
            return (
              <li key={item.view} role="none">
                <button
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    console.log('[navbar] click', item.view);
                    onNavigate(item.view);
                  }}
                  data-active={active || undefined}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-cinematic-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-lumina-orange-500 data-[active]:text-lumina-orange-400 data-[active]:font-semibold data-[active]:shadow-glow-orange transition-all cursor-pointer"
                >
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
