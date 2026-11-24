import type { FC } from 'react';

interface WeightValueProps {
  weight: number;
  unit?: 'kg' | 'lb';
  className?: string;
}

export const WeightValue: FC<WeightValueProps> = ({
  weight,
  unit = 'kg',
  className = '',
}) => (
  <div data-testid="weight-value" className={className}>
    <p className="text-base-content/60 text-xs tracking-wide uppercase">
      Weight
    </p>
    <p className="text-xl font-semibold">
      {weight.toFixed(1)}{' '}
      <span className="text-base-content/60 text-sm">{unit}</span>
    </p>
  </div>
);
