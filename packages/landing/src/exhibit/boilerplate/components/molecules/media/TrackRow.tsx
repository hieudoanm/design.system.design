import type { FC } from 'react';

interface TrackRowProps {
  title: string;
  artist: string;
  duration: string;
  index?: number;
  playing?: boolean;
  onPlay?: () => void;
}

export const TrackRow: FC<TrackRowProps> = ({
  title,
  artist,
  duration,
  index,
  playing = false,
  onPlay,
}) => (
  <div
    data-testid="track-row"
    className={`flex items-center gap-3 px-4 py-2 transition-colors ${
      playing ? 'bg-primary/10' : 'hover:bg-base-200'
    }`}>
    <span className="text-base-content/50 w-8 text-center text-sm">
      {index !== undefined ? index + 1 : '♪'}
    </span>
    <div className="min-w-0 flex-1">
      <p
        className={`truncate text-sm ${
          playing ? 'text-primary font-semibold' : ''
        }`}>
        {title}
      </p>
      <p className="text-base-content/50 truncate text-xs">{artist}</p>
    </div>
    <span className="text-base-content/50 text-xs">{duration}</span>
    <button
      type="button"
      aria-label={playing ? 'Pause' : 'Play'}
      className="btn btn-ghost btn-sm btn-circle"
      onClick={onPlay}>
      {playing ? '⏸' : '▶'}
    </button>
  </div>
);

TrackRow.displayName = 'TrackRow';
