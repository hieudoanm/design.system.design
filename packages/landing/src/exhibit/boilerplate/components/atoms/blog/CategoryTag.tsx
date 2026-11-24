import type { FC } from 'react';

type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface CategoryTagProps {
  label: string;
  href?: string;
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

export const CategoryTag: FC<CategoryTagProps> = ({
  label,
  href,
  variant = 'primary',
}) => {
  const className = `badge badge-outline badge-lg ${variantClass[variant]}`;
  if (href) {
    return (
      <a href={href} data-testid="category-tag" className={className}>
        {label}
      </a>
    );
  }
  return (
    <span data-testid="category-tag" className={className}>
      {label}
    </span>
  );
};
