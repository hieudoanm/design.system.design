import type { FC } from 'react';

interface DistanceValueProps {
  distance: number;
  unit?: 'km' | 'mi';
  className?: string;
}

export const DistanceValue: FC<DistanceValueProps> = ({
  distance,
  unit = 'km',
  className = '',
}) => (
  <div data-testid="distance-value" className={className}>
    <p className="text-base-content/60 text-xs tracking-wide uppercase">
      Distance
    </p>
    <p className="text-xl font-semibold">
      {distance.toFixed(2)}{' '}
      <span className="text-base-content/60 text-sm">{unit}</span>
    </p>
  </div>
);
