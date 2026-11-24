import type { FC } from 'react';

interface UpdateBadgeProps {
  label?: string;
  time?: string;
}

export const UpdateBadge: FC<UpdateBadgeProps> = ({
  label = 'Updated',
  time,
}) => (
  <span
    className="badge badge-success badge-sm gap-1"
    data-testid="update-badge">
    <span aria-hidden>↻</span>
    {label}
    {time && <span className="text-base-content/60">{time}</span>}
  </span>
);
