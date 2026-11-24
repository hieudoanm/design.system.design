import type { FC, ReactNode } from 'react';
import { FiTrendingDown, FiTrendingUp } from 'react-icons/fi';

interface StatTrendProps {
  label: string;
  value: string;
  trend?: number;
  icon?: ReactNode;
  className?: string;
}

const formatTrend = (trend: number): string =>
  `${trend >= 0 ? '+' : ''}${Math.round(trend * 10) / 10}%`;

export const StatTrend: FC<StatTrendProps> = ({
  label,
  value,
  trend,
  icon,
  className = '',
}) => {
  const up = (trend ?? 0) >= 0;

  return (
    <div
      className={`card bg-base-200 border-base-content/10 border p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-base-content/60 text-sm">{label}</span>
        {icon && <span className="text-base-content/40">{icon}</span>}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{value}</span>
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              up ? 'text-success' : 'text-error'
            }`}>
            {up ? <FiTrendingUp /> : <FiTrendingDown />}
            {formatTrend(trend)}
          </span>
        )}
      </div>
    </div>
  );
};

StatTrend.displayName = 'StatTrend';
