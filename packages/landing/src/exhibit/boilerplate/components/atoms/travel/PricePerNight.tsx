import type { FC } from 'react';

interface PricePerNightProps {
  amount: number;
  currency?: string;
}

const symbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  VND: '₫',
};

export const PricePerNight: FC<PricePerNightProps> = ({
  amount,
  currency = 'USD',
}) => (
  <span
    className="inline-flex items-baseline gap-1"
    data-testid="price-per-night">
    <span className="text-lg font-semibold">
      {symbols[currency] ?? `${currency} `}
      {amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
    <span className="text-base-content/60 text-xs">/ night</span>
  </span>
);
