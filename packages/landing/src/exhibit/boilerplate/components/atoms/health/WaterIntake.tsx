import type { FC } from 'react';

interface WaterIntakeProps {
  amount: number;
  unit?: 'ml' | 'cups';
  goal?: number;
  className?: string;
}

const unitLabel: Record<NonNullable<WaterIntakeProps['unit']>, string> = {
  ml: 'ml',
  cups: 'cups',
};

export const WaterIntake: FC<WaterIntakeProps> = ({
  amount,
  unit = 'ml',
  goal,
  className = '',
}) => (
  <div data-testid="water-intake" className={className}>
    <p className="text-2xl font-semibold">
      {amount}
      <span className="text-base-content/60 ml-1 text-sm">
        {unitLabel[unit]}
      </span>
    </p>
    {goal !== undefined ? (
      <p className="text-base-content/60 text-sm">
        Goal {goal} {unitLabel[unit]}
      </p>
    ) : null}
  </div>
);
