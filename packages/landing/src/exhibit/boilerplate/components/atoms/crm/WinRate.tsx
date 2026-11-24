import type { FC } from 'react';

interface WinRateProps {
  rate: number;
  label?: string;
}

export const WinRate: FC<WinRateProps> = ({ rate, label = 'Win rate' }) => {
  const clamped = Math.min(100, Math.max(0, rate));
  return (
    <div data-testid="win-rate" className="w-40">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-base-content/70">{label}</span>
        <span className="font-semibold">{Math.round(clamped)}%</span>
      </div>
      <progress
        className="progress progress-success h-2 w-full"
        value={clamped}
        max="100"
      />
    </div>
  );
};
