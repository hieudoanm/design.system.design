'use client';

import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import type { FC, ReactNode } from 'react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: 'left' | 'right';
  overlay?: boolean;
  widthClass?: string;
  children?: ReactNode;
  footer?: ReactNode;
}

export const Drawer: FC<DrawerProps> = ({
  open,
  onClose,
  title,
  side = 'left',
  overlay = true,
  widthClass = 'w-80',
  children,
  footer,
}) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <div className={`drawer ${side === 'right' ? 'drawer-end' : ''}`}>
      <input
        type="checkbox"
        className="drawer-toggle"
        readOnly
        checked={open}
        aria-label="Toggle drawer"
      />
      <div className="drawer-side z-40">
        {overlay && (
          <label
            className="drawer-overlay"
            aria-label="Close drawer overlay"
            onClick={onClose}
          />
        )}
        <aside
          className={`bg-base-100 border-base-content/10 flex min-h-full flex-col border-r ${widthClass}`}>
          <div className="border-base-content/10 flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-base font-semibold">{title}</h3>
            <button
              type="button"
              aria-label="Close drawer"
              className="btn btn-circle btn-ghost btn-sm"
              onClick={onClose}>
              <FiX aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
          {footer && (
            <div className="border-base-content/10 border-t p-4">{footer}</div>
          )}
        </aside>
      </div>
    </div>
  );
};
