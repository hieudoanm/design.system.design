import type { FC } from 'react';

interface CastMember {
  name: string;
  role: string;
}

interface Movie {
  title: string;
  year: number;
  rating: number;
  genres: string[];
  duration: number;
  synopsis: string;
  cast: CastMember[];
}

interface MovieDetailProps {
  movie: Movie;
  onPlay?: () => void;
  onWatchlist?: () => void;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const MovieDetail: FC<MovieDetailProps> = ({
  movie,
  onPlay,
  onWatchlist,
}) => {
  return (
    <section data-testid="movie-detail" className="flex flex-col gap-4">
      <div className="card bg-base-200">
        <figure className="relative flex aspect-video items-center justify-center">
          <span className="text-base-content/30 text-4xl" aria-hidden="true">
            &#127909;
          </span>
          <span className="badge badge-warning absolute top-3 left-3">
            &#9733; {movie.rating.toFixed(1)}
          </span>
        </figure>
        <div className="card-body gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="card-title">{movie.title}</h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onPlay}>
                Play
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={onWatchlist}>
                + Watchlist
              </button>
            </div>
          </div>
          <div className="text-base-content/60 flex flex-wrap items-center gap-2 text-sm">
            <span>{movie.year}</span>
            <span>&middot;</span>
            <span>{formatDuration(movie.duration)}</span>
            <span>&middot;</span>
            <div className="flex flex-wrap gap-1">
              {movie.genres.map((genre) => (
                <span key={genre} className="badge badge-outline badge-sm">
                  {genre}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm leading-relaxed">{movie.synopsis}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Cast</h3>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {movie.cast.map((member) => (
            <li key={member.name} className="card bg-base-200">
              <div className="card-body gap-0 p-3">
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-base-content/50 text-xs">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
