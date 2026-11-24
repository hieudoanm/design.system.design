import type { FC } from 'react';

interface ExchangeCardProps {
  from: string;
  to: string;
  amount: number;
  rate: number;
  converted?: number;
  onSwap?: () => void;
}

export const ExchangeCard: FC<ExchangeCardProps> = ({
  from,
  to,
  amount,
  rate,
  converted,
  onSwap,
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="exchange-card">
    <div className="card-body gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-base-content/50 text-xs uppercase">{from}</p>
          <p
            className="font-mono text-lg font-semibold"
            data-testid="exchange-amount">
            {amount.toLocaleString()} {from}
          </p>
        </div>
        <button
          type="button"
          aria-label="Swap currencies"
          className="btn btn-ghost btn-circle btn-sm"
          onClick={onSwap}>
          ⇄
        </button>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-base-content/50 text-xs uppercase">{to}</p>
          <p
            className="font-mono text-lg font-semibold"
            data-testid="exchange-converted">
            {(converted ?? amount * rate).toLocaleString()} {to}
          </p>
        </div>
      </div>
      <p className="text-base-content/50 text-center text-xs">
        1 {from} = {rate} {to}
      </p>
    </div>
  </div>
);
