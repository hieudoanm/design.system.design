import type { FC, ReactNode } from 'react';

interface MetricLabelProps {
  label: string;
  value: ReactNode;
  unit?: string;
  className?: string;
}

export const MetricLabel: FC<MetricLabelProps> = ({
  label,
  value,
  unit,
  className = '',
}) => (
  <div data-testid="metric-label" className={className}>
    <p className="text-base-content/60 text-xs tracking-wide uppercase">
      {label}
    </p>
    <p className="text-xl font-semibold">
      {value}
      {unit ? (
        <span className="text-base-content/60 ml-1 text-sm">{unit}</span>
      ) : null}
    </p>
  </div>
);
