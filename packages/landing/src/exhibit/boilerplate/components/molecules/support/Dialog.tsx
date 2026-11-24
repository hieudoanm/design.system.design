'use client';

import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import type { FC, ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
}

export const Dialog: FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnBackdrop = true,
}) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="bg-base-content/40 absolute inset-0 h-full w-full cursor-default"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-base-100 border-base-content/10 relative flex w-full max-w-md flex-col gap-4 rounded-2xl border p-6 shadow-2xl">
        {(title || description) && (
          <div className="flex items-start justify-between gap-4">
            <div>
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              {description && (
                <p className="text-base-content/60 mt-1 text-sm">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="Close dialog"
              className="btn btn-circle btn-ghost btn-sm"
              onClick={onClose}>
              <FiX />
            </button>
          </div>
        )}
        {children && <div className="flex-1 overflow-y-auto">{children}</div>}
        {footer && <div className="flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};
