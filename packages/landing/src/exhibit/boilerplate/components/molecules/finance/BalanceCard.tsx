import type { FC } from 'react';

interface BalanceCardProps {
  title?: string;
  label?: string;
  balance: number;
  currency?: string;
  trend?: number;
}

export const BalanceCard: FC<BalanceCardProps> = ({
  title = 'Total Balance',
  label = 'Available balance',
  balance,
  currency = '$',
  trend,
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="balance-card">
    <div className="card-body gap-3">
      <div className="flex items-center justify-between">
        <h3 className="card-title text-base">{title}</h3>
        {trend !== undefined && (
          <span
            data-testid="balance-trend"
            className={`badge ${trend >= 0 ? 'badge-success' : 'badge-error'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(2)}%
          </span>
        )}
      </div>
      <p className="text-base-content/60 text-sm">{label}</p>
      <p className="text-3xl font-bold" data-testid="balance-value">
        {currency}
        {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  </div>
);
