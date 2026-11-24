import type { FC, ReactNode } from 'react';

interface MetaLabelProps {
  children: ReactNode;
  className?: string;
}

export const MetaLabel: FC<MetaLabelProps> = ({ children, className = '' }) => (
  <span
    data-testid="meta-label"
    className={`text-base-content/60 text-sm ${className}`}>
    {children}
  </span>
);
