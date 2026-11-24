import type { FC } from 'react';

interface LoanCardProps {
  lender: string;
  principal: number;
  balance: number;
  rate: number;
  term?: string;
  nextPayment?: string;
  currency?: string;
}

export const LoanCard: FC<LoanCardProps> = ({
  lender,
  principal,
  balance,
  rate,
  term,
  nextPayment,
  currency = '$',
}) => {
  const pct =
    principal > 0
      ? Math.max(
          0,
          Math.min(100, Math.round(((principal - balance) / principal) * 100))
        )
      : 0;
  return (
    <div className="card bg-base-100 w-full shadow" data-testid="loan-card">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">{lender}</h3>
          <span className="text-base-content/50 text-sm">{pct}% repaid</span>
        </div>
        <p className="text-3xl font-bold" data-testid="loan-balance">
          {currency}
          {balance.toLocaleString()}
        </p>
        <progress
          className="progress progress-primary h-2 w-full"
          value={pct}
          max={100}
        />
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-base-content/50 text-xs">Rate</p>
            <p className="font-medium">{rate}%</p>
          </div>
          {term && (
            <div>
              <p className="text-base-content/50 text-xs">Term</p>
              <p className="font-medium">{term}</p>
            </div>
          )}
          {nextPayment && (
            <div>
              <p className="text-base-content/50 text-xs">Next payment</p>
              <p className="font-medium">{nextPayment}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
