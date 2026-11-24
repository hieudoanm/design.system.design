import type { FC } from 'react';

interface CashFlowProps {
  inflow: number;
  outflow: number;
  currency?: string;
  className?: string;
}

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);

export const CashFlow: FC<CashFlowProps> = ({
  inflow,
  outflow,
  currency = 'USD',
  className = '',
}) => {
  const net = inflow - outflow;
  return (
    <div
      data-testid="cash-flow"
      className={`flex items-center gap-4 text-sm ${className}`}>
      <span className="text-success">+{formatAmount(inflow, currency)}</span>
      <span className="text-error">-{formatAmount(outflow, currency)}</span>
      <span className="text-base-content/60 font-medium">
        Net {formatAmount(net, currency)}
      </span>
    </div>
  );
};
