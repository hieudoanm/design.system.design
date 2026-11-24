'use client';

import type { FC, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

interface MenubarItem {
  label: string;
  icon?: ReactNode;
  children?: ReactNode;
}

interface MenubarProps {
  items: MenubarItem[];
  ariaLabel?: string;
}

export const Menubar: FC<MenubarProps> = ({
  items,
  ariaLabel = 'Menu bar',
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setActiveIndex(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel}
      className="bg-base-200 flex w-full flex-wrap items-center gap-1 rounded-xl px-2 py-1">
      {items.map((item, index) => {
        const active = activeIndex === index;
        return (
          <div key={item.label} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={active}
              className={`btn btn-ghost btn-sm gap-2 ${active ? 'bg-base-300' : ''}`}
              onClick={() => setActiveIndex(active ? null : index)}>
              {item.icon}
              {item.label}
            </button>
            {active && item.children && (
              <div
                role="menu"
                className="border-base-content/10 bg-base-100 absolute top-full left-0 z-50 mt-1 w-48 rounded-xl border p-1 shadow-lg">
                {item.children}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

Menubar.displayName = 'Menubar';
