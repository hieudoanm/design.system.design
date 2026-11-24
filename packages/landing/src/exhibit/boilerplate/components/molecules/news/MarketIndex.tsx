import type { FC } from 'react';

interface MarketIndexProps {
  name: string;
  value: number;
  change: number;
  changePercent?: number;
  currency?: string;
}

export const MarketIndex: FC<MarketIndexProps> = ({
  name,
  value,
  change,
  changePercent,
  currency = '',
}) => {
  const rising = change >= 0;
  const changeClass = rising ? 'text-success' : 'text-error';
  const arrow = rising ? '\u25B2' : '\u25BC';

  return (
    <div
      className="flex items-center justify-between gap-4 px-1 py-3"
      data-testid="market-index">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        <span className="font-mono text-lg font-light">
          {currency}
          {value.toLocaleString()}
        </span>
      </div>
      <span
        className={`badge badge-ghost gap-1 font-mono ${changeClass}`}
        data-testid="market-index-change">
        {arrow} {change > 0 ? '+' : ''}
        {change.toFixed(2)}
        {changePercent !== undefined &&
          ` (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%)`}
      </span>
    </div>
  );
};
