import type { FC } from 'react';

interface TitleBadgeProps {
  title: string;
  variant?: 'primary' | 'neutral' | 'ghost';
}

const variantClass: Record<NonNullable<TitleBadgeProps['variant']>, string> = {
  primary: 'badge-primary',
  neutral: 'badge-neutral',
  ghost: 'badge-ghost',
};

export const TitleBadge: FC<TitleBadgeProps> = ({
  title,
  variant = 'primary',
}) => (
  <span data-testid="title-badge" className={`badge ${variantClass[variant]}`}>
    {title}
  </span>
);
