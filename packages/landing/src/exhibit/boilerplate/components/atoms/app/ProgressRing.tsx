import type { FC } from 'react';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
}

const clamp = (value: number): number => Math.min(100, Math.max(0, value));

export const ProgressRing: FC<ProgressRingProps> = ({
  value,
  size = 64,
  strokeWidth = 6,
  showValue = false,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = clamp(value);
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-base-content/15 fill-none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-primary fill-none"
        />
      </svg>
      {showValue && (
        <span className="absolute text-sm font-medium">{clamped}%</span>
      )}
    </div>
  );
};
