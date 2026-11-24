import type { FC } from 'react';

interface PriceLabelProps {
  amount: number;
  currency?: string;
  strikethrough?: boolean;
}

const symbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  VND: '₫',
};

const format = (amount: number, currency: string) =>
  `${symbols[currency] ?? `${currency} `}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const PriceLabel: FC<PriceLabelProps> = ({
  amount,
  currency = 'USD',
  strikethrough = false,
}) => (
  <span
    className={`text-base-content ${strikethrough ? 'text-base-content/50 line-through' : ''}`}
    data-testid="price-label">
    {format(amount, currency)}
  </span>
);
