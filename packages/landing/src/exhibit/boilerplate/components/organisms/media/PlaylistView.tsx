import type { FC } from 'react';

interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
}

interface PlaylistViewProps {
  name: string;
  tracks: PlaylistTrack[];
  onPlay?: (id: string) => void;
  onPlayAll?: () => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
};

export const PlaylistView: FC<PlaylistViewProps> = ({
  name,
  tracks,
  onPlay,
  onPlayAll,
}) => {
  return (
    <section data-testid="playlist-view" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{name}</h2>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onPlayAll}>
          Play all
        </button>
      </div>
      {tracks.length === 0 ? (
        <p className="text-base-content/50 text-sm">
          No tracks in this playlist.
        </p>
      ) : (
        <ul className="divide-base-content/10 bg-base-200 flex flex-col divide-y rounded-xl px-2">
          {tracks.map((track, index) => (
            <li
              key={track.id}
              className="flex items-center justify-between gap-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-base-content/40 w-6 text-center text-sm">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-medium">{track.title}</h3>
                  <p className="text-base-content/50 text-xs">{track.artist}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base-content/50 text-xs">
                  {formatTime(track.duration)}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-label={`Play ${track.title}`}
                  onClick={() => onPlay?.(track.id)}>
                  &#9654;
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
