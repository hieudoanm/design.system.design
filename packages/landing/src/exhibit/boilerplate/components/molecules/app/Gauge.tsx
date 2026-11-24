import type { CSSProperties, FC } from 'react';

type GaugeVariant =
  'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';

interface GaugeProps {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  label?: string;
  showValue?: boolean;
  variant?: GaugeVariant;
  className?: string;
}

const clamp = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);

const variantClass: Record<GaugeVariant, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

export const Gauge: FC<GaugeProps> = ({
  value,
  max = 100,
  size = 6,
  thickness = 0.6,
  label,
  showValue = false,
  variant = 'primary',
  className = '',
}) => {
  const safeMax = max <= 0 ? 100 : max;
  const clamped = clamp(value, 0, safeMax);
  const percent = Math.round((clamped / safeMax) * 100);

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label ?? 'Gauge'}
        className={`radial-progress ${variantClass[variant]}`}
        style={
          {
            '--value': clamped,
            '--size': `${size}rem`,
            '--thickness': `${thickness}rem`,
          } as CSSProperties
        }>
        {showValue && <span className="text-sm font-semibold">{percent}%</span>}
      </div>
      {label && <span className="text-base-content/60 text-sm">{label}</span>}
    </div>
  );
};

Gauge.displayName = 'Gauge';
