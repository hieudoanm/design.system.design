import type { FC } from 'react';

interface VideoItem {
  id: string;
  title: string;
  category: string;
  duration: number;
}

interface VideoCatalogProps {
  videos: VideoItem[];
  title?: string;
  onPlay?: (id: string) => void;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const VideoCatalog: FC<VideoCatalogProps> = ({
  videos,
  title = 'Video catalog',
  onPlay,
}) => {
  return (
    <section data-testid="video-catalog" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        <button type="button" className="btn btn-ghost btn-sm">
          View all
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <article key={video.id} className="card bg-base-200">
            <figure className="bg-accent/20 relative flex aspect-video items-center justify-center">
              <span
                className="text-base-content/30 text-3xl"
                aria-hidden="true">
                &#9654;
              </span>
              <span className="badge badge-neutral absolute top-2 right-2 text-xs">
                {formatDuration(video.duration)}
              </span>
            </figure>
            <div className="card-body gap-1 p-3">
              <p className="text-base-content/50 text-xs">{video.category}</p>
              <h3 className="text-sm font-medium">{video.title}</h3>
              <button
                type="button"
                className="btn btn-ghost btn-xs mt-1 self-start"
                aria-label={`Play ${video.title}`}
                onClick={() => onPlay?.(video.id)}>
                Play
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
