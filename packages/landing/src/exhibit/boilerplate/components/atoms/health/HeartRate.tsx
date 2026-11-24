import type { FC } from 'react';

interface HeartRateProps {
  bpm: number;
  className?: string;
}

const zoneClass = (bpm: number): string => {
  if (bpm < 60) return 'text-info';
  if (bpm < 100) return 'text-success';
  if (bpm < 120) return 'text-warning';
  return 'text-error';
};

export const HeartRate: FC<HeartRateProps> = ({ bpm, className = '' }) => (
  <div
    data-testid="heart-rate"
    className={`flex items-center gap-2 ${className}`}>
    <span role="img" aria-label="heart" className="text-error">
      ♥
    </span>
    <p className={`text-2xl font-semibold ${zoneClass(bpm)}`}>{bpm}</p>
    <p className="text-base-content/60 text-sm">bpm</p>
  </div>
);
