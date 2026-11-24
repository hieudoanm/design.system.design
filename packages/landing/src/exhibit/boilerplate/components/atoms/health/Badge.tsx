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

interface BadgeProps {
  variant?: BadgeVariant;
  outline?: boolean;
  children: ReactNode;
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

export const Badge: FC<BadgeProps> = ({
  variant = 'neutral',
  outline = false,
  children,
}) => (
  <span
    className={`badge ${variantClass[variant]} ${outline ? 'badge-outline' : ''}`}>
    {children}
  </span>
);
