'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/', exact: true },
  { label: 'History', href: '/history' },
  { label: 'Stats', href: '/stats' },
  { label: 'Settings', href: '/settings' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    const onScroll = () => setIsTop(window.scrollY < 4);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        isTop ? 'border-transparent' : 'border-zinc-200 dark:border-zinc-800'
      } bg-white/85 dark:bg-black/70 backdrop-blur`}
    >
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Mental Clarity
          </span>
        </div>
        <ul className="flex items-center gap-1" role="menubar">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && pathname !== '/';
            return (
              <li key={item.href} role="none">
                <Link
                  href={item.href}
                  role="menuitem"
                  data-active={active || undefined}
                  className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-clarity-medium data-[active]:text-clarity-high data-[active]:font-semibold"
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
