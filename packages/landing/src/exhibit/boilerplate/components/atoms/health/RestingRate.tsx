import type { FC } from 'react';

interface RestingRateProps {
  bpm: number;
  className?: string;
}

export const RestingRate: FC<RestingRateProps> = ({ bpm, className = '' }) => (
  <div data-testid="resting-rate" className={className}>
    <p className="text-base-content/60 text-xs tracking-wide uppercase">
      Resting Rate
    </p>
    <p className="text-xl font-semibold">
      {bpm} <span className="text-base-content/60 text-sm">bpm</span>
    </p>
  </div>
);
