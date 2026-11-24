import type { FC } from 'react';

interface IncomeIconProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClass: Record<NonNullable<IncomeIconProps['size']>, string> = {
  sm: 'w-6 h-6 text-sm',
  md: 'w-8 h-8 text-base',
  lg: 'w-10 h-10 text-lg',
};

export const IncomeIcon: FC<IncomeIconProps> = ({
  label = 'income',
  size = 'md',
  className = '',
}) => (
  <span
    role="img"
    aria-label={label}
    data-testid="income-icon"
    className={`bg-success/10 text-success inline-flex items-center justify-center rounded-full ${sizeClass[size]} ${className}`}>
    ↑
  </span>
);
