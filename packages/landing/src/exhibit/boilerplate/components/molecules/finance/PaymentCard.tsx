import type { FC } from 'react';

interface PaymentCardProps {
  provider: string;
  last4: string;
  holder?: string;
  expiry?: string;
  primary?: boolean;
}

export const PaymentCard: FC<PaymentCardProps> = ({
  provider,
  last4,
  holder,
  expiry,
  primary = false,
}) => (
  <div
    data-testid="payment-card"
    className="from-base-200 to-base-100 card border-base-content/10 w-full border bg-gradient-to-br shadow">
    <div className="card-body gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{provider}</span>
        {primary && (
          <span className="badge badge-primary badge-sm">Primary</span>
        )}
      </div>
      <p
        className="font-mono text-lg tracking-widest"
        data-testid="payment-number">
        •••• {last4}
      </p>
      <div className="flex items-end justify-between">
        <div>
          {holder && (
            <p className="text-base-content/60 text-xs uppercase">{holder}</p>
          )}
          {expiry && (
            <p className="text-base-content/50 text-xs">Exp {expiry}</p>
          )}
        </div>
        <span className="text-xl">💳</span>
      </div>
    </div>
  </div>
);
