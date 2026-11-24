'use client';

import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
}

export const Dropdown: FC<DropdownProps> = ({ trigger, items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [close]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <ul
          role="menu"
          className="border-base-content/10 bg-base-100 absolute right-0 z-50 mt-1 w-48 rounded-xl border p-1 shadow-lg">
          {items.map((item, index) => (
            <li key={index} role="none">
              <button
                role="menuitem"
                onClick={() => {
                  item.onClick();
                  close();
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  item.danger
                    ? 'text-error hover:bg-error/10'
                    : 'hover:bg-base-200'
                }`}>
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
