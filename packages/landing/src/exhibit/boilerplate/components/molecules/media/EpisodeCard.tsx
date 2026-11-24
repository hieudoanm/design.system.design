import type { FC } from 'react';

interface EpisodeCardProps {
  title: string;
  show: string;
  duration: string;
  description?: string;
  publishedAt?: string;
  progress?: number;
  onPlay?: () => void;
}

export const EpisodeCard: FC<EpisodeCardProps> = ({
  title,
  show,
  duration,
  description,
  publishedAt,
  progress,
  onPlay,
}) => (
  <div
    data-testid="episode-card"
    className="card bg-base-200 flex-row items-center gap-4">
    <div className="bg-base-content/10 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl">
      🎧
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-base-content/50 text-xs">{show}</p>
      <h3 className="truncate text-sm font-semibold">{title}</h3>
      {description && (
        <p className="text-base-content/50 line-clamp-1 text-xs">
          {description}
        </p>
      )}
      <div className="flex items-center gap-2">
        <p className="text-base-content/50 text-xs">
          {duration}
          {publishedAt && ` · ${publishedAt}`}
        </p>
        {progress !== undefined && (
          <progress
            className="progress progress-primary h-1.5 w-24"
            value={progress}
            max={100}
          />
        )}
      </div>
    </div>
    <button
      type="button"
      aria-label="Play episode"
      className="btn btn-primary btn-sm btn-circle"
      onClick={onPlay}>
      ▶
    </button>
  </div>
);

EpisodeCard.displayName = 'EpisodeCard';
