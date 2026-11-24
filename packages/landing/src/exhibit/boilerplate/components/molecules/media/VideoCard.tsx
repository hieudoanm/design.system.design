import type { FC } from 'react';

interface VideoCardProps {
  title: string;
  channel: string;
  views: string;
  duration: string;
  thumbnailUrl?: string;
  onPlay?: () => void;
}

export const VideoCard: FC<VideoCardProps> = ({
  title,
  channel,
  views,
  duration,
  thumbnailUrl,
  onPlay,
}) => (
  <button
    type="button"
    onClick={onPlay}
    data-testid="video-card"
    className="card bg-base-200 text-left transition-transform hover:-translate-y-0.5">
    <figure className="relative h-40">
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="bg-base-content/10 flex h-full w-full items-center justify-center text-4xl">
          ▶
        </div>
      )}
      <span className="badge badge-neutral absolute right-2 bottom-2">
        {duration}
      </span>
    </figure>
    <div className="card-body gap-1 p-4">
      <h3 className="card-title line-clamp-2 text-sm">{title}</h3>
      <p className="text-base-content/50 text-sm">
        {channel} · {views} views
      </p>
    </div>
  </button>
);

VideoCard.displayName = 'VideoCard';
