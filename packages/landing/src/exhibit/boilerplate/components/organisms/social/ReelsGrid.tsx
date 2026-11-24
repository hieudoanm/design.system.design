import type { FC } from 'react';

interface Reel {
  id: string;
  title: string;
  views: number;
  likes: number;
  duration: string;
}

interface ReelsGridProps {
  reels: Reel[];
  onPlay?: (id: string) => void;
}

export const ReelsGrid: FC<ReelsGridProps> = ({ reels, onPlay }) => {
  if (reels.length === 0) {
    return (
      <div data-testid="reels-grid" className="card bg-base-200">
        <div className="card-body items-center text-center">
          <p className="text-base-content/60">No reels available</p>
        </div>
      </div>
    );
  }

  return (
    <section data-testid="reels-grid" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Reels</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {reels.map((reel) => (
          <button
            key={reel.id}
            type="button"
            className="card bg-base-200 group relative text-left"
            onClick={() => onPlay?.(reel.id)}>
            <div className="bg-primary/20 flex aspect-[9/16] items-center justify-center">
              <span
                aria-hidden="true"
                className="text-3xl transition-transform group-hover:scale-125">
                &#9654;
              </span>
            </div>
            <div className="card-body gap-1 p-3">
              <h3 className="line-clamp-1 text-sm font-medium">{reel.title}</h3>
              <p className="text-base-content/50 text-xs">
                {reel.views.toLocaleString()} views
              </p>
              <p className="text-base-content/50 text-xs">
                <span aria-hidden="true">&#10084;</span> {reel.likes}
              </p>
            </div>
            <span className="badge badge-ghost absolute top-2 right-2">
              {reel.duration}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
