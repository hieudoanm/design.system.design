import type { FC, ReactNode } from 'react';

type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface ArticleBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantClass: Record<BadgeVariant, string> = {
  neutral: 'badge-neutral',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

export const ArticleBadge: FC<ArticleBadgeProps> = ({
  children,
  variant = 'neutral',
}) => (
  <span
    data-testid="article-badge"
    className={`badge badge-sm ${variantClass[variant]}`}>
    {children}
  </span>
);
