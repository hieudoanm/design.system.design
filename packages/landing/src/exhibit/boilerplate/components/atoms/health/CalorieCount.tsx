import type { FC } from 'react';

interface CalorieCountProps {
  calories: number;
  goal?: number;
  className?: string;
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US').format(value);

export const CalorieCount: FC<CalorieCountProps> = ({
  calories,
  goal,
  className = '',
}) => (
  <div data-testid="calorie-count" className={className}>
    <p className="text-2xl font-semibold">
      {formatNumber(calories)}
      <span className="text-base-content/60 ml-1 text-sm">kcal</span>
    </p>
    {goal !== undefined ? (
      <p className="text-base-content/60 text-sm">
        Goal {formatNumber(goal)} kcal
      </p>
    ) : null}
  </div>
);
