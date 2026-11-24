import type { FC } from 'react';

interface TrendPoint {
  month: string;
  amount: number;
}

interface SpendingTrendsProps {
  data: TrendPoint[];
  currency?: string;
  title?: string;
}

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const SpendingTrends: FC<SpendingTrendsProps> = ({
  data,
  currency = 'USD',
  title = 'Spending trends',
}) => {
  const max = Math.max(...data.map((point) => point.amount), 0);

  return (
    <section className="card bg-base-200 w-full">
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        {data.length === 0 ? (
          <p className="text-base-content/40 text-sm" data-testid="empty">
            No spending data yet.
          </p>
        ) : (
          <div className="flex h-40 items-end gap-2" data-testid="trend-bars">
            {data.map((point) => (
              <div
                key={point.month}
                className="flex flex-1 flex-col items-center gap-1">
                <span className="text-base-content/60 text-xs">
                  {formatAmount(point.amount, currency)}
                </span>
                <div
                  className="bg-primary w-full rounded-t"
                  data-testid={`bar-${point.month}`}
                  style={{
                    height:
                      max > 0
                        ? `${Math.round((point.amount / max) * 100)}%`
                        : '2px',
                  }}
                />
                <span className="text-base-content/50 text-xs">
                  {point.month}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
