import type { FC } from 'react';

interface MonthlyStatProps {
  label: string;
  value: string | number;
  className?: string;
}

export const MonthlyStat: FC<MonthlyStatProps> = ({
  label,
  value,
  className = '',
}) => (
  <div data-testid="monthly-stat" className={className}>
    <p className="text-base-content/60 text-xs tracking-wide uppercase">
      {label}
    </p>
    <p className="stat-value text-lg font-semibold">{value}</p>
  </div>
);
