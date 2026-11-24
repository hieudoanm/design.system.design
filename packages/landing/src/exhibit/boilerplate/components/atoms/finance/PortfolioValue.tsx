import type { FC } from 'react';

interface PortfolioValueProps {
  value: number;
  change: number;
  currency?: string;
  className?: string;
}

export const PortfolioValue: FC<PortfolioValueProps> = ({
  value,
  change,
  currency = 'USD',
  className = '',
}) => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
  const up = change >= 0;
  return (
    <div data-testid="portfolio-value" className={className}>
      <p className="text-base-content/60 text-xs tracking-wide uppercase">
        Portfolio
      </p>
      <p className="text-3xl font-semibold">{formatted}</p>
      <p className={`text-sm ${up ? 'text-success' : 'text-error'}`}>
        {up ? '▲' : '▼'} {change.toFixed(2)}%
      </p>
    </div>
  );
};
