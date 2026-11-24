import type { FC } from 'react';

type PriorityLevel = 'low' | 'medium' | 'high';

interface DealPriorityProps {
  priority: PriorityLevel;
  label?: string;
}

const priorityClass: Record<PriorityLevel, string> = {
  low: 'badge-info',
  medium: 'badge-warning',
  high: 'badge-error',
};

const defaultLabel: Record<PriorityLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const DealPriority: FC<DealPriorityProps> = ({ priority, label }) => (
  <span
    data-testid="deal-priority"
    className={`badge ${priorityClass[priority]}`}>
    {label ?? defaultLabel[priority]}
  </span>
);
