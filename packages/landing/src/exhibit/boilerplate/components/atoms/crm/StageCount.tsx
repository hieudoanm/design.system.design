import type { FC } from 'react';

interface StageCountProps {
  count: number;
  label?: string;
}

export const StageCount: FC<StageCountProps> = ({ count, label = '' }) => (
  <span
    data-testid="stage-count"
    className="badge badge-outline badge-sm gap-1">
    {label && <span className="opacity-60">{label}</span>}
    {count}
  </span>
);
