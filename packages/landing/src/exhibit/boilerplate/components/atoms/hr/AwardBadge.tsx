import type { FC } from 'react';

interface AwardBadgeProps {
  label: string;
  icon?: string;
  variant?: 'gold' | 'silver' | 'bronze';
}

const variantClass: Record<NonNullable<AwardBadgeProps['variant']>, string> = {
  gold: 'badge-warning',
  silver: 'badge-neutral',
  bronze: 'badge-error',
};

export const AwardBadge: FC<AwardBadgeProps> = ({
  label,
  icon = '🏅',
  variant = 'gold',
}) => (
  <span
    data-testid="award-badge"
    className={`badge badge-sm gap-1 ${variantClass[variant]}`}>
    {icon && <span aria-hidden="true">{icon}</span>}
    {label}
  </span>
);
