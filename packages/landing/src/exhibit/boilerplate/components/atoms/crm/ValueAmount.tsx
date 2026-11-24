import type { FC } from 'react';

interface ValueAmountProps {
  value: number;
  currency?: string;
  decimals?: number;
  className?: string;
}

export const ValueAmount: FC<ValueAmountProps> = ({
  value,
  currency = 'USD',
  decimals = 0,
  className = '',
}) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  return (
    <span data-testid="value-amount" className={`font-semibold ${className}`}>
      {formatted}
    </span>
  );
};
