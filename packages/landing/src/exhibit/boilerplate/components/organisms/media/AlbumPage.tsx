import type { FC } from 'react';

interface AlbumTrack {
  id: string;
  title: string;
  duration: number;
}

interface Album {
  title: string;
  artist: string;
  year?: number;
  tracks: AlbumTrack[];
}

interface AlbumPageProps {
  album: Album;
  onPlayTrack?: (id: string) => void;
  onPlayAll?: () => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
};

const totalDuration = (tracks: AlbumTrack[]): number =>
  tracks.reduce((sum, track) => sum + track.duration, 0);

export const AlbumPage: FC<AlbumPageProps> = ({
  album,
  onPlayTrack,
  onPlayAll,
}) => {
  const runtime = totalDuration(album.tracks);

  return (
    <section data-testid="album-page" className="flex flex-col gap-4">
      <div className="card bg-base-200">
        <div className="card-body gap-4 sm:flex-row sm:items-center">
          <div className="bg-primary/20 flex aspect-square w-28 shrink-0 items-center justify-center rounded-xl">
            <span className="text-4xl" aria-hidden="true">
              &#9835;
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base-content/50 text-xs">Album</p>
            <h2 className="text-xl font-medium" data-testid="album-title">
              {album.title}
            </h2>
            <p className="text-base-content/60 text-sm">{album.artist}</p>
            <p className="text-base-content/50 text-xs">
              {album.year ?? ''} {album.tracks.length} tracks &middot;{' '}
              {formatTime(runtime)}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onPlayAll}>
            Play album
          </button>
        </div>
      </div>
      <ul className="divide-base-content/10 bg-base-200 flex flex-col divide-y rounded-xl px-2">
        {album.tracks.map((track, index) => (
          <li
            key={track.id}
            className="flex items-center justify-between gap-3 py-2">
            <div className="flex items-center gap-3">
              <span className="text-base-content/40 w-6 text-center text-sm">
                {index + 1}
              </span>
              <span className="text-sm font-medium">{track.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base-content/50 text-xs">
                {formatTime(track.duration)}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                aria-label={`Play ${track.title}`}
                onClick={() => onPlayTrack?.(track.id)}>
                &#9654;
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
