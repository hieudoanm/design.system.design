import type { FC } from 'react';

interface UnreadBadgeProps {
  count: number;
  label?: string;
}

export const UnreadBadge: FC<UnreadBadgeProps> = ({
  count,
  label = 'unread',
}) => {
  if (count <= 0) return null;
  return (
    <span
      aria-label={`${count} ${label}`}
      className="badge badge-error badge-xs"
      data-testid="unread-badge">
      {count > 99 ? '99+' : count}
    </span>
  );
};
