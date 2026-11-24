import type { FC } from 'react';

interface TempValueProps {
  value: number;
  unit?: 'C' | 'F';
  className?: string;
}

export const TempValue: FC<TempValueProps> = ({
  value,
  unit = 'C',
  className = '',
}) => (
  <div data-testid="temp-value" className={className}>
    <p className="text-2xl font-semibold">
      {value.toFixed(1)}°
      <span className="text-base-content/60 text-sm">{unit}</span>
    </p>
  </div>
);
