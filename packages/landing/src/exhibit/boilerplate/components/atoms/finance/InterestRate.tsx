import type { FC } from 'react';

interface InterestRateProps {
  rate: number;
  period?: string;
  className?: string;
}

export const InterestRate: FC<InterestRateProps> = ({
  rate,
  period = 'APY',
  className = '',
}) => (
  <span data-testid="interest-rate" className={className}>
    <span className="font-semibold">{rate.toFixed(2)}%</span>
    <span className="text-base-content/60 ml-1 text-xs uppercase">
      {period}
    </span>
  </span>
);
