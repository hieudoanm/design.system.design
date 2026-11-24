'use client';

import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import type { FC, ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  children?: ReactNode;
  footer?: ReactNode;
}

const panelClass: Record<NonNullable<SheetProps['side']>, string> = {
  left: 'left-0 top-0 h-full w-80 border-r',
  right: 'right-0 top-0 h-full w-80 border-l',
  top: 'left-0 top-0 w-full border-b',
  bottom: 'left-0 bottom-0 w-full border-t',
};

export const Sheet: FC<SheetProps> = ({
  open,
  onClose,
  title,
  side = 'right',
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close sheet backdrop"
        className="bg-base-content/40 absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-base-100 absolute flex flex-col shadow-xl ${panelClass[side]}`}>
        <div className="border-base-content/10 flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            type="button"
            aria-label="Close sheet"
            className="btn btn-circle btn-ghost btn-sm"
            onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="border-base-content/10 border-t p-4">{footer}</div>
        )}
      </div>
    </div>
  );
};
