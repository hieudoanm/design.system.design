import type { FC } from 'react';

interface Holding {
  symbol: string;
  name: string;
  value: number;
  change: number;
}

interface InvestmentPortfolioProps {
  holdings: Holding[];
  totalValue: number;
  currency?: string;
  title?: string;
}

const formatValue = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const changeClass = (change: number): string =>
  change >= 0 ? 'text-success' : 'text-error';

export const InvestmentPortfolio: FC<InvestmentPortfolioProps> = ({
  holdings,
  totalValue,
  currency = 'USD',
  title = 'Investment portfolio',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body">
      <div className="flex items-center justify-between">
        <h3 className="card-title">{title}</h3>
        <span className="badge badge-primary">
          {formatValue(totalValue, currency)}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table data-testid="holdings-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Value</th>
              <th>24h</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => (
              <tr key={holding.symbol}>
                <td>
                  <div className="flex flex-col">
                    <span className="font-medium">{holding.symbol}</span>
                    <span className="text-base-content/50 text-xs">
                      {holding.name}
                    </span>
                  </div>
                </td>
                <td>{formatValue(holding.value, currency)}</td>
                <td className={changeClass(holding.change)}>
                  {holding.change >= 0 ? '+' : ''}
                  {holding.change}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {holdings.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No holdings yet.
        </p>
      )}
    </div>
  </section>
);
