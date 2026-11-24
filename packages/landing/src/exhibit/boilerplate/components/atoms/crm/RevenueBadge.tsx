import type { FC } from 'react';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error';

interface RevenueBadgeProps {
  value: number;
  prefix?: string;
  variant?: BadgeVariant;
}

const variantClass: Record<BadgeVariant, string> = {
  neutral: 'badge-neutral',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
};

export const RevenueBadge: FC<RevenueBadgeProps> = ({
  value,
  prefix = '$',
  variant = 'neutral',
}) => {
  const compact = value.toLocaleString('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  return (
    <span
      data-testid="revenue-badge"
      className={`badge badge-lg ${variantClass[variant]}`}>
      {prefix}
      {compact}
    </span>
  );
};
