import type { FC } from 'react';

interface HeightLabelProps {
  height: number;
  unit?: 'cm' | 'in';
  className?: string;
}

export const HeightLabel: FC<HeightLabelProps> = ({
  height,
  unit = 'cm',
  className = '',
}) => (
  <div data-testid="height-label" className={className}>
    <p className="text-base-content/60 text-xs tracking-wide uppercase">
      Height
    </p>
    <p className="text-xl font-semibold">
      {height} <span className="text-base-content/60 text-sm">{unit}</span>
    </p>
  </div>
);
