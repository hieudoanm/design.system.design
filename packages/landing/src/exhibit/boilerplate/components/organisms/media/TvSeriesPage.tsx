import type { FC } from 'react';

interface Episode {
  id: string;
  title: string;
  season: number;
  episode: number;
  duration: number;
}

interface TvSeries {
  title: string;
  year: number;
  rating: number;
  seasons: number;
  episodes: Episode[];
}

interface TvSeriesPageProps {
  series: TvSeries;
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

export const TvSeriesPage: FC<TvSeriesPageProps> = ({ series, onPlay }) => {
  return (
    <section data-testid="tv-series-page" className="flex flex-col gap-4">
      <div className="card bg-base-200">
        <div className="card-body gap-3">
          <h2 className="card-title">{series.title}</h2>
          <div className="text-base-content/60 flex flex-wrap items-center gap-2 text-sm">
            <span>{series.year}</span>
            <span>&middot;</span>
            <span className="badge badge-warning badge-sm">
              &#9733; {series.rating.toFixed(1)}
            </span>
            <span>&middot;</span>
            <span>{series.seasons} seasons</span>
            <span>&middot;</span>
            <span>{series.episodes.length} episodes</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Episodes</h3>
        <ul className="divide-base-content/10 bg-base-200 flex flex-col divide-y rounded-xl px-2">
          {series.episodes.map((episode) => (
            <li
              key={episode.id}
              className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-base-content/40 w-8 text-center text-sm">
                  S{episode.season}E{episode.episode}
                </span>
                <div>
                  <h3 className="text-sm font-medium">{episode.title}</h3>
                  <p className="text-base-content/50 text-xs">
                    {formatDuration(episode.duration)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-label={`Play ${episode.title}`}
                onClick={() => onPlay?.(episode.id)}>
                &#9654;
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
