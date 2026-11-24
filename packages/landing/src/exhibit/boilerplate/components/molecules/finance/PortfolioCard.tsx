import type { FC } from 'react';

interface Holding {
  name: string;
  value: number;
  change?: number;
}

interface PortfolioCardProps {
  title?: string;
  totalValue: number;
  change?: number;
  holdings: Holding[];
  currency?: string;
}

export const PortfolioCard: FC<PortfolioCardProps> = ({
  title = 'Portfolio',
  totalValue,
  change,
  holdings,
  currency = '$',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="portfolio-card">
    <div className="card-body gap-3">
      <div className="flex items-center justify-between">
        <h3 className="card-title text-base">{title}</h3>
        {change !== undefined && (
          <span
            className={`badge ${change >= 0 ? 'badge-success' : 'badge-error'}`}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold" data-testid="portfolio-value">
        {currency}
        {totalValue.toLocaleString()}
      </p>
      <ul className="divide-base-content/10 flex flex-col divide-y">
        {holdings.map((holding) => (
          <li
            key={holding.name}
            className="flex items-center justify-between py-2 text-sm">
            <span className="font-medium">{holding.name}</span>
            <span className="text-base-content/60">
              {currency}
              {holding.value.toLocaleString()}
              {holding.change !== undefined && (
                <span
                  className={
                    holding.change >= 0 ? 'text-success' : 'text-error'
                  }>
                  {' '}
                  ({holding.change >= 0 ? '+' : ''}
                  {holding.change.toFixed(2)}%)
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
