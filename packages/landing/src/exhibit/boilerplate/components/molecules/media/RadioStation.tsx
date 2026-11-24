import type { FC } from 'react';

interface RadioStationProps {
  name: string;
  genre?: string;
  frequency?: string;
  listeners?: number;
  live?: boolean;
  onTune?: () => void;
}

export const RadioStation: FC<RadioStationProps> = ({
  name,
  genre,
  frequency,
  listeners,
  live = false,
  onTune,
}) => (
  <div
    data-testid="radio-station"
    className="border-base-content/10 flex items-center gap-4 border-b px-4 py-3">
    <div className="bg-primary/15 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl">
      📻
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className="truncate text-sm font-semibold">{name}</p>
        {live && <span className="badge badge-error badge-xs">LIVE</span>}
      </div>
      <p className="text-base-content/50 truncate text-xs">
        {[genre, frequency].filter(Boolean).join(' · ')}
        {listeners !== undefined &&
          ` · ${listeners.toLocaleString()} listeners`}
      </p>
    </div>
    <button
      type="button"
      aria-label={`Tune to ${name}`}
      className="btn btn-primary btn-sm btn-circle"
      onClick={onTune}>
      ▶
    </button>
  </div>
);

RadioStation.displayName = 'RadioStation';
