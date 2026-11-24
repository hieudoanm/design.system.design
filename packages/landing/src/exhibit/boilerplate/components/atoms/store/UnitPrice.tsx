import type { FC } from 'react';

interface UnitPriceProps {
  amount: number;
  currency?: string;
  per?: string;
}

const symbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  VND: '₫',
};

export const UnitPrice: FC<UnitPriceProps> = ({
  amount,
  currency = 'USD',
  per = 'unit',
}) => (
  <span className="text-base-content/60 text-sm" data-testid="unit-price">
    {symbols[currency] ?? `${currency} `}
    {amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}{' '}
    / {per}
  </span>
);
