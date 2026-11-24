import type { FC } from 'react';

interface DividerProps {
  label?: string;
  className?: string;
}

export const Divider: FC<DividerProps> = ({ label, className = '' }) => (
  <div className={`divider ${className}`}>{label}</div>
);
