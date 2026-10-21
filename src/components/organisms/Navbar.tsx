'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { basePath } from '@/lib/paths';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import type { FC } from 'react';

type Mode = 'landing' | 'design-system' | 'system-design';

const ITEMS: ReadonlyArray<{
  id: Mode;
  label: string;
  href: string;
  name: string;
}> = [
  { id: 'design-system', label: 'Design', href: '/design-system', name: 'Design System' },
  { id: 'landing', label: 'System', href: '/', name: 'System (home)' },
  { id: 'system-design', label: 'Design', href: '/system-design', name: 'System Design' },
];

/**
 * The highlight covers a run of the three buttons:
 *  - landing:       the middle button only
 *  - design-system: left + middle  ("Design System")
 *  - system-design: middle + right ("System Design")
 */
const PILL: Record<Mode, { start: number; span: number; bg: string; glow: string }> = {
  landing: {
    start: 1,
    span: 1,
    bg: 'rgba(17, 24, 39, 0.92)',
    glow: 'rgba(17, 24, 39, 0.28)',
  },
  'design-system': {
    start: 0,
    span: 2,
    bg: 'rgba(194, 37, 92, 0.95)',
    glow: 'rgba(194, 37, 92, 0.38)',
  },
  'system-design': {
    start: 1,
    span: 2,
    bg: 'rgba(31, 79, 216, 0.95)',
    glow: 'rgba(31, 79, 216, 0.38)',
  },
};

const modeFor = (pathname: string): Mode => {
  // `usePathname` may or may not include the base path, so drop it first.
  const path = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
  if (path.startsWith('/design-system')) return 'design-system';
  if (path.startsWith('/system-design')) return 'system-design';
  return 'landing';
};

const Navbar: FC = () => {
  const pathname = usePathname();
  // Move the highlight on click, before the route has finished loading.
  const [pending, setPending] = useState<Mode | null>(null);

  useEffect(() => {
    setPending(null);
  }, [pathname]);

  const mode = pending ?? modeFor(pathname);
  const pill = PILL[mode];
  const lit = (index: number) => index >= pill.start && index < pill.start + pill.span;

  return (
    <header className='fixed inset-x-0 top-4 z-50 flex justify-center px-4'>
      <nav aria-label='Primary' className='glass rounded-full p-1.5'>
        <div className='relative grid w-[min(86vw,22rem)] grid-cols-3'>
          <motion.span
            aria-hidden
            className='toggle-pill absolute inset-y-0 rounded-full'
            layout
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              left: `${(pill.start / 3) * 100}%`,
              width: `${(pill.span / 3) * 100}%`,
              backgroundColor: pill.bg,
              boxShadow: `0 6px 18px ${pill.glow}, inset 0 1px 0 rgba(255,255,255,0.28)`,
            }}
          />
          {ITEMS.map((item, i) => (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.name}
              aria-current={item.id === modeFor(pathname) ? 'page' : undefined}
              title={item.name}
              onClick={() => setPending(item.id)}
              className={`relative z-10 rounded-full px-4 py-2 text-center text-sm font-semibold tracking-wide transition-colors duration-300 ${
                lit(i) ? 'text-white' : 'text-ink/60 hover:text-ink'
              }`}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
