import type { FC } from 'react';

interface PriorityFlagProps {
  priority: 'high' | 'normal' | 'low';
  className?: string;
}

const badgeClasses = {
  high: 'badge-error',
  normal: 'badge-warning',
  low: 'badge-ghost',
} as const;

const labels = {
  high: 'High',
  normal: 'Normal',
  low: 'Low',
} as const;

export const PriorityFlag: FC<PriorityFlagProps> = ({
  priority,
  className = '',
}) => (
  <span
    data-testid="priority-flag"
    className={`badge badge-sm gap-1 ${badgeClasses[priority]} ${className}`}>
    <span aria-hidden="true">🚩</span>
    {labels[priority]}
  </span>
);
