import type { FC } from 'react';

interface CryptoAsset {
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change: number;
}

interface CryptoPortfolioProps {
  assets: CryptoAsset[];
  currency?: string;
  title?: string;
}

const formatAmount = (value: number): string =>
  value >= 1000 ? value.toLocaleString() : value.toFixed(4);

const formatValue = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const changeClass = (change: number): string =>
  change >= 0 ? 'text-success' : 'text-error';

export const CryptoPortfolio: FC<CryptoPortfolioProps> = ({
  assets,
  currency = 'USD',
  title = 'Crypto portfolio',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body">
      <h3 className="card-title">{title}</h3>
      <div className="overflow-x-auto">
        <table data-testid="crypto-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th className="text-right">Holdings</th>
              <th className="text-right">Value</th>
              <th>24h</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.symbol}>
                <td>
                  <div className="flex flex-col">
                    <span className="font-medium">{asset.symbol}</span>
                    <span className="text-base-content/50 text-xs">
                      {asset.name}
                    </span>
                  </div>
                </td>
                <td className="text-right">{formatAmount(asset.amount)}</td>
                <td className="text-right">
                  {formatValue(asset.value, currency)}
                </td>
                <td className={changeClass(asset.change)}>
                  {asset.change >= 0 ? '+' : ''}
                  {asset.change}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {assets.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No crypto assets.
        </p>
      )}
    </div>
  </section>
);
