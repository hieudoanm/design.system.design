import type { FC } from 'react';

interface VolumeLevelProps {
  level: number;
  className?: string;
}

const clamp = (value: number): number => Math.max(0, Math.min(100, value));

export const VolumeLevel: FC<VolumeLevelProps> = ({
  level,
  className = '',
}) => {
  const value = clamp(level);
  const icon = value <= 0 ? 'muted' : value < 50 ? 'low' : 'high';
  return (
    <span
      data-testid="volume-level"
      className={`text-base-content/70 inline-flex items-center gap-1.5 text-sm ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        data-icon={icon}
        className="h-4 w-4">
        <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
        {icon === 'muted' && <path d="M22 9l-6 6M16 9l6 6" />}
        {icon === 'low' && <path d="M16 9.5a4 4 0 0 1 0 5" />}
        {icon === 'high' && (
          <>
            <path d="M16 9a5 5 0 0 1 0 6" />
            <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
          </>
        )}
      </svg>
      <span data-testid="volume-percent">{value}%</span>
    </span>
  );
};
