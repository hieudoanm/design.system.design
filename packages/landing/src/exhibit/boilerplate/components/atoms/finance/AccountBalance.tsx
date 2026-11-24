import type { FC } from 'react';

interface AccountBalanceProps {
  accountName: string;
  balance: number;
  currency?: string;
  variant?: 'default' | 'credit' | 'debit';
  className?: string;
}

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);

const variantClass: Record<
  NonNullable<AccountBalanceProps['variant']>,
  string
> = {
  default: 'text-base-content',
  credit: 'text-success',
  debit: 'text-error',
};

export const AccountBalance: FC<AccountBalanceProps> = ({
  accountName,
  balance,
  currency = 'USD',
  variant = 'default',
  className = '',
}) => (
  <div data-testid="account-balance" className={className}>
    <p className="text-base-content/60 text-xs tracking-wide uppercase">
      {accountName}
    </p>
    <p className={`text-xl font-semibold ${variantClass[variant]}`}>
      {formatAmount(balance, currency)}
    </p>
  </div>
);
