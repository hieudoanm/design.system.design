import type { FC } from 'react';

interface InboxBadgeProps {
  count: number;
  label?: string;
  className?: string;
}

export const InboxBadge: FC<InboxBadgeProps> = ({
  count,
  label = 'unread',
  className = '',
}) => (
  <span
    data-testid="inbox-badge"
    className={`badge badge-primary badge-sm ${className}`}>
    {count} {label}
  </span>
);
