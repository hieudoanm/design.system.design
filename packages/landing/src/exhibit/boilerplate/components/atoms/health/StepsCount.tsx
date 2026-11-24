import type { FC } from 'react';

interface StepsCountProps {
  steps: number;
  goal?: number;
  className?: string;
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('en-US').format(value);

export const StepsCount: FC<StepsCountProps> = ({
  steps,
  goal,
  className = '',
}) => (
  <div data-testid="steps-count" className={className}>
    <p className="text-2xl font-semibold">{formatNumber(steps)}</p>
    <p className="text-base-content/60 text-sm">
      steps
      {goal !== undefined ? ` of ${formatNumber(goal)} goal` : ''}
    </p>
  </div>
);
