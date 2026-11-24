import type { FC } from 'react';

interface VideoThumbProps {
  title: string;
  src?: string;
  durationSeconds?: number;
  className?: string;
}

const formatDuration = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`;
};

export const VideoThumb: FC<VideoThumbProps> = ({
  title,
  src,
  durationSeconds,
  className = '',
}) => (
  <div
    data-testid="video-thumb"
    className={`bg-base-200 relative aspect-video overflow-hidden rounded-lg ${className}`}>
    {src ? (
      <img src={src} alt={title} className="h-full w-full object-cover" />
    ) : (
      <span className="text-base-content/60 flex h-full w-full items-center justify-center text-sm">
        No preview
      </span>
    )}
    <span className="badge badge-neutral badge-sm absolute bottom-2 left-2">
      {title}
    </span>
    {durationSeconds !== undefined && (
      <span className="badge badge-neutral badge-sm absolute right-2 bottom-2 tabular-nums">
        {formatDuration(durationSeconds)}
      </span>
    )}
  </div>
);
