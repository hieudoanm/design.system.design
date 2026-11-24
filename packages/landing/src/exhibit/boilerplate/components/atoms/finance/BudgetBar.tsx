import type { FC } from 'react';

interface BudgetBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

export const BudgetBar: FC<BudgetBarProps> = ({
  value,
  max = 100,
  label,
  className = '',
}) => {
  const percent =
    max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div data-testid="budget-bar" className={className}>
      {label ? (
        <p className="text-base-content/60 mb-1 text-sm">{label}</p>
      ) : null}
      <progress
        data-testid="budget-bar-progress"
        className="progress progress-primary"
        value={percent}
        max={100}>
        {percent.toFixed(0)}%
      </progress>
    </div>
  );
};
