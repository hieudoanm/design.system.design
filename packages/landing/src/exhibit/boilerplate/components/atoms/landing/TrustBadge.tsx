import type { FC } from 'react';

interface TrustBadgeProps {
  label: string;
  icon?: string;
}

export const TrustBadge: FC<TrustBadgeProps> = ({ label, icon = '🛡' }) => (
  <span
    data-testid="trust-badge"
    className="badge badge-outline badge-sm gap-1">
    {icon && <span aria-hidden="true">{icon}</span>}
    {label}
  </span>
);
