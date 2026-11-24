import type { FC } from 'react';

interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

interface MarketWatchProps {
  quotes: Quote[];
  currency?: string;
  title?: string;
}

const formatPrice = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

const changeClass = (change: number): string =>
  change >= 0 ? 'text-success' : 'text-error';

export const MarketWatch: FC<MarketWatchProps> = ({
  quotes,
  currency = 'USD',
  title = 'Market watch',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body">
      <h3 className="card-title">{title}</h3>
      <div className="overflow-x-auto">
        <table data-testid="quotes-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.symbol}>
                <td>
                  <div className="flex flex-col">
                    <span className="font-medium">{quote.symbol}</span>
                    <span className="text-base-content/50 text-xs">
                      {quote.name}
                    </span>
                  </div>
                </td>
                <td>{formatPrice(quote.price, currency)}</td>
                <td className={changeClass(quote.change)}>
                  {quote.change >= 0 ? '▲' : '▼'} {Math.abs(quote.change)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {quotes.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No market data available.
        </p>
      )}
    </div>
  </section>
);
