import type { FC } from 'react';

interface OnlineBadgeProps {
  label?: string;
  name?: string;
}

export const OnlineBadge: FC<OnlineBadgeProps> = ({
  label = 'Online',
  name,
}) => (
  <span
    className="badge badge-success badge-sm gap-1"
    data-testid="online-badge">
    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
    {name ? `${name} · ${label}` : label}
  </span>
);
