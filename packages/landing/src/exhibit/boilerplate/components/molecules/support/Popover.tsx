'use client';

import { cloneElement, useEffect, useRef, useState } from 'react';
import type { FC, ReactElement, ReactNode } from 'react';

interface PopoverProps {
  trigger: ReactElement<{
    onClick?: () => void;
    'aria-haspopup'?: string;
    'aria-expanded'?: boolean;
  }>;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
}

const alignClass: Record<NonNullable<PopoverProps['align']>, string> = {
  start: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
};

export const Popover: FC<PopoverProps> = ({
  trigger,
  children,
  align = 'start',
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative inline-block">
      {cloneElement(trigger, {
        onClick: () => setOpen((current) => !current),
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
      })}
      {open && (
        <div
          role="dialog"
          className={`bg-base-100 border-base-content/10 absolute z-10 mt-2 w-64 rounded-xl border p-4 shadow-xl ${alignClass[align]}`}>
          {children}
        </div>
      )}
    </div>
  );
};
