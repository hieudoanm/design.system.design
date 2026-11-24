import type { FC } from 'react';

interface DistanceLabelProps {
  value: number;
  unit?: string;
}

export const DistanceLabel: FC<DistanceLabelProps> = ({
  value,
  unit = 'km',
}) => (
  <span
    className="text-base-content/70 inline-flex items-center gap-1 text-sm"
    data-testid="distance-label">
    {value.toLocaleString('en-US')} {unit}
  </span>
);
