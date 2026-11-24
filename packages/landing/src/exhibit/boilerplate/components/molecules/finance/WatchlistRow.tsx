import type { FC } from 'react';

interface WatchlistRowProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  currency?: string;
  onSelect?: (symbol: string) => void;
}

export const WatchlistRow: FC<WatchlistRowProps> = ({
  symbol,
  name,
  price,
  change,
  currency = '$',
  onSelect,
}) => (
  <button
    type="button"
    data-testid="watchlist-row"
    onClick={() => onSelect?.(symbol)}
    className="hover:bg-base-200 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors">
    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full font-mono text-xs font-bold">
      {symbol.slice(0, 4)}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold">{name}</p>
      <p className="text-base-content/50 font-mono text-xs">{symbol}</p>
    </div>
    <div className="text-right">
      <p
        className="font-mono text-sm font-semibold"
        data-testid="watchlist-price">
        {currency}
        {price.toFixed(2)}
      </p>
      <p
        className={`text-xs font-medium ${
          change >= 0 ? 'text-success' : 'text-error'
        }`}>
        {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
      </p>
    </div>
  </button>
);
