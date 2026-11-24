import type { FC } from 'react';

interface TopTrack {
  id: string;
  title: string;
  plays: number;
}

interface ArtistProfileProps {
  name: string;
  genres: string[];
  monthlyListeners?: number;
  topTracks: TopTrack[];
  onFollow?: () => void;
}

const formatCount = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

export const ArtistProfile: FC<ArtistProfileProps> = ({
  name,
  genres,
  monthlyListeners = 0,
  topTracks,
  onFollow,
}) => {
  return (
    <section data-testid="artist-profile" className="flex flex-col gap-4">
      <div className="card bg-base-200">
        <div className="card-body gap-4">
          <div className="flex items-center gap-4">
            <div className="avatar placeholder">
              <div className="bg-secondary/20 w-20 rounded-full">
                <span className="text-2xl">{name.charAt(0)}</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-medium">{name}</h2>
              <div className="mt-1 flex flex-wrap gap-1">
                {genres.map((genre) => (
                  <span key={genre} className="badge badge-outline badge-sm">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onFollow}>
              Follow
            </button>
          </div>
          <div className="stats stats-vertical bg-base-100 sm:stats-horizontal">
            <div className="stat">
              <div className="stat-title">Monthly listeners</div>
              <div className="stat-value text-lg" data-testid="listeners">
                {formatCount(monthlyListeners)}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Top tracks</div>
              <div className="stat-value text-lg">{topTracks.length}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Popular tracks</h3>
        <ul className="divide-base-content/10 bg-base-200 flex flex-col divide-y rounded-xl px-3">
          {topTracks.map((track) => (
            <li
              key={track.id}
              className="flex items-center justify-between py-2">
              <span className="text-sm">{track.title}</span>
              <span className="text-base-content/50 text-xs">
                {formatCount(track.plays)} plays
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
