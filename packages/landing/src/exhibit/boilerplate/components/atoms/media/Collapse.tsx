'use client';

import type { FC, ReactNode } from 'react';

interface CollapseProps {
  title: string;
  children: ReactNode;
  open?: boolean;
  onChange?: (open: boolean) => void;
  className?: string;
}

export const Collapse: FC<CollapseProps> = ({
  title,
  children,
  open = false,
  onChange,
  className = '',
}) => (
  <div
    className={`collapse-arrow border-base-300 bg-base-200 collapse border ${className}`}>
    <input
      type="checkbox"
      aria-label={title}
      checked={open}
      onChange={(e) => onChange?.(e.target.checked)}
    />
    <div className="collapse-title text-sm font-medium">{title}</div>
    <div className="collapse-content text-sm">{children}</div>
  </div>
);
