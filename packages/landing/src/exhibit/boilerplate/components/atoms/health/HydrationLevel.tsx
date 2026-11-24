import type { FC } from 'react';

interface HydrationLevelProps {
  percent: number;
  className?: string;
}

const clamp = (value: number): number => Math.min(100, Math.max(0, value));

export const HydrationLevel: FC<HydrationLevelProps> = ({
  percent,
  className = '',
}) => (
  <div data-testid="hydration-level" className={className}>
    <div className="mb-1 flex justify-between text-sm">
      <span className="text-base-content/60">Hydration</span>
      <span className="font-medium">{clamp(percent)}%</span>
    </div>
    <progress
      data-testid="hydration-level-progress"
      className="progress progress-info"
      value={clamp(percent)}
      max={100}>
      {clamp(percent)}%
    </progress>
  </div>
);
