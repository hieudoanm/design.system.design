import type { FC } from 'react';

interface CurrencyTagProps {
  code: string;
  amount?: number;
  className?: string;
}

export const CurrencyTag: FC<CurrencyTagProps> = ({
  code,
  amount,
  className = '',
}) => {
  const formatted = amount
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
      }).format(amount)
    : '';
  return (
    <span
      data-testid="currency-tag"
      className={`badge badge-outline badge-lg ${className}`}>
      {code}
      {amount !== undefined ? <span className="ml-1">{formatted}</span> : null}
    </span>
  );
};
