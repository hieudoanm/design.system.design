import type { FC } from 'react';

interface PricingTagProps {
  amount: number;
  period: string;
  currency?: string;
}

export const PricingTag: FC<PricingTagProps> = ({
  amount,
  period,
  currency = '$',
}) => (
  <div data-testid="pricing-tag" className="flex items-baseline gap-1">
    <span className="text-2xl font-bold">
      {currency}
      {amount}
    </span>
    <span className="text-base-content/50 text-sm">/{period}</span>
  </div>
);
