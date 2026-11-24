import type { FC } from 'react';

interface ProductBadgeProps {
  label: string;
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'error';
}

export const ProductBadge: FC<ProductBadgeProps> = ({
  label,
  variant = 'primary',
}) => (
  <span className={`badge badge-${variant}`} data-testid="product-badge">
    {label}
  </span>
);
