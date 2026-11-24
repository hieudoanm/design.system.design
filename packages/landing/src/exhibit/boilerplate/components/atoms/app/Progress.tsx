import type { FC } from 'react';

type ProgressVariant =
  'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: ProgressVariant;
  label?: string;
  showValue?: boolean;
  className?: string;
}

const variantClass: Record<ProgressVariant, string> = {
  primary: 'progress-primary',
  secondary: 'progress-secondary',
  accent: 'progress-accent',
  success: 'progress-success',
  warning: 'progress-warning',
  error: 'progress-error',
};

const sizeClass: Record<NonNullable<ProgressProps['size']>, string> = {
  sm: 'h-1',
  md: 'h-2.5',
  lg: 'h-4',
};

const clamp = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);

export const Progress: FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  label,
  showValue = false,
  className = '',
}) => {
  const safeMax = max <= 0 ? 100 : max;
  const clamped = clamp(value, 0, safeMax);
  const percent = Math.round((clamped / safeMax) * 100);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span>{label}</span>}
          {showValue && (
            <span className="text-base-content/50">{percent}%</span>
          )}
        </div>
      )}
      <progress
        className={`progress ${variantClass[variant]} ${sizeClass[size]}`}
        value={clamped}
        max={safeMax}
        aria-label={label ?? 'Progress'}
      />
    </div>
  );
};
