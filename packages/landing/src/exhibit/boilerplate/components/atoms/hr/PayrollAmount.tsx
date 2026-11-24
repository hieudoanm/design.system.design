import type { FC } from 'react';

interface PayrollAmountProps {
  amount: number;
  currency?: string;
  period?: 'monthly' | 'yearly' | 'hourly';
  locale?: string;
}

const periodLabel: Record<NonNullable<PayrollAmountProps['period']>, string> = {
  monthly: '/mo',
  yearly: '/yr',
  hourly: '/hr',
};

export const PayrollAmount: FC<PayrollAmountProps> = ({
  amount,
  currency = 'USD',
  period = 'monthly',
  locale = 'en-US',
}) => {
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
  return (
    <span data-testid="payroll-amount" className="text-sm font-semibold">
      {formatted}
      <span className="text-base-content/50"> {periodLabel[period]}</span>
    </span>
  );
};
