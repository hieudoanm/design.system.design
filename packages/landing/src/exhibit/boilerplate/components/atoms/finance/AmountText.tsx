import type { FC } from 'react';

interface AmountTextProps {
  amount: number;
  currency?: string;
  className?: string;
}

export const AmountText: FC<AmountTextProps> = ({
  amount,
  currency = 'USD',
  className = '',
}) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
  return (
    <span data-testid="amount-text" className={className}>
      {formatted}
    </span>
  );
};
