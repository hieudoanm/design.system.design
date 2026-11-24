'use client';

import type { FC, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

interface NavigationMenuItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

interface NavigationMenuProps {
  items: NavigationMenuItem[];
  ariaLabel?: string;
}

export const NavigationMenu: FC<NavigationMenuProps> = ({
  items,
  ariaLabel = 'Primary',
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null);
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
      className="bg-base-200 flex items-center gap-1 rounded-xl px-2 py-1.5">
      {items.map((item, index) => {
        const open = openIndex === index;
        const content = item.children ? (
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpenIndex(open ? null : index)}
            className={`btn btn-ghost btn-sm gap-2 ${open ? 'bg-base-300' : ''}`}>
            {item.icon}
            {item.label}
          </button>
        ) : (
          <a
            href={item.href}
            className="btn btn-ghost btn-sm gap-2"
            onClick={() => setOpenIndex(null)}>
            {item.icon}
            {item.label}
          </a>
        );

        return (
          <div key={item.label} className="relative">
            {content}
            {open && item.children && (
              <div className="border-base-content/10 bg-base-100 absolute top-full left-0 z-50 mt-1 w-64 rounded-xl border p-2 shadow-lg">
                {item.children}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

NavigationMenu.displayName = 'NavigationMenu';
