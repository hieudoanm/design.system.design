import type { FC } from 'react';

interface BalanceLabelProps {
  label: string;
  balance: number;
  currency?: string;
  className?: string;
}

export const BalanceLabel: FC<BalanceLabelProps> = ({
  label,
  balance,
  currency = 'USD',
  className = '',
}) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(balance);
  return (
    <div data-testid="balance-label" className={className}>
      <p className="text-base-content/60 text-xs tracking-wide uppercase">
        {label}
      </p>
      <p className="text-2xl font-semibold">{formatted}</p>
    </div>
  );
};
