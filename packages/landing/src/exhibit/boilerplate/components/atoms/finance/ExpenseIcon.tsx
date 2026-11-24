import type { FC } from 'react';

interface ExpenseIconProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClass: Record<NonNullable<ExpenseIconProps['size']>, string> = {
  sm: 'w-6 h-6 text-sm',
  md: 'w-8 h-8 text-base',
  lg: 'w-10 h-10 text-lg',
};

export const ExpenseIcon: FC<ExpenseIconProps> = ({
  label = 'expense',
  size = 'md',
  className = '',
}) => (
  <span
    role="img"
    aria-label={label}
    data-testid="expense-icon"
    className={`bg-error/10 text-error inline-flex items-center justify-center rounded-full ${sizeClass[size]} ${className}`}>
    ↓
  </span>
);
