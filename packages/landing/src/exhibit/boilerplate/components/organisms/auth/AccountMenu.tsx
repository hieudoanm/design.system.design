'use client';

import type { FC, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface AccountMenuItem {
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onClick?: () => void;
}

interface AccountMenuProps {
  name: string;
  email?: string;
  avatar?: ReactNode;
  items: AccountMenuItem[];
}

export const AccountMenu: FC<AccountMenuProps> = ({
  name,
  email,
  avatar,
  items,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="btn btn-ghost flex items-center gap-2">
        {avatar}
        <span className="flex flex-col items-start">
          <span className="text-sm font-medium">{name}</span>
          {email && (
            <span className="text-base-content/50 text-xs">{email}</span>
          )}
        </span>
        <FiChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="border-base-content/10 bg-base-100 absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border p-1 shadow-xl">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className={`hover:bg-base-200 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                item.danger ? 'text-error' : ''
              }`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

AccountMenu.displayName = 'AccountMenu';
