import type { FC } from 'react';

interface SavingGoalProps {
  current: number;
  target: number;
  currency?: string;
  className?: string;
}

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const SavingGoal: FC<SavingGoalProps> = ({
  current,
  target,
  currency = 'USD',
  className = '',
}) => {
  const percent = target <= 0 ? 0 : Math.min(100, (current / target) * 100);
  return (
    <div data-testid="saving-goal" className={className}>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium">{formatAmount(current, currency)}</span>
        <span className="text-base-content/60">
          {formatAmount(target, currency)}
        </span>
      </div>
      <progress
        data-testid="saving-goal-progress"
        className="progress progress-accent"
        value={percent}
        max={100}>
        {percent.toFixed(0)}%
      </progress>
    </div>
  );
};
