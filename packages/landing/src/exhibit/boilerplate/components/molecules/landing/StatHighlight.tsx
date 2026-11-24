import type { FC } from 'react';

interface StatHighlightProps {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon?: string;
  className?: string;
}

export const StatHighlight: FC<StatHighlightProps> = ({
  label,
  value,
  delta,
  positive = true,
  icon,
  className = '',
}) => {
  return (
    <div
      data-testid="stat-highlight"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-base-content/50 text-xs tracking-wide uppercase">
          {label}
        </span>
        {icon && (
          <span aria-hidden="true" className="text-base-content/50 text-lg">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-semibold">{value}</span>
        {delta && (
          <span
            className={`badge badge-sm mb-1 ${
              positive ? 'badge-success' : 'badge-error'
            }`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
};
