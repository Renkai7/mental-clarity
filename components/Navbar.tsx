"use client";
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    console.log('[navbar] view changed to', currentView);
  }, [currentView]);

  useEffect(() => {
    const onScroll = () => setIsTop(window.scrollY < 4);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        isTop ? 'border-transparent' : 'border-border'
      } bg-surface/85 backdrop-blur`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-text">
            Mental Clarity
          </span>
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
                  className="rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[active]:text-primary data-[active]:font-semibold"
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
