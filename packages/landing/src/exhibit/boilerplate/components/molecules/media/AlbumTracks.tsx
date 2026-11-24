import type { FC } from 'react';

interface Track {
  id: string;
  title: string;
  duration: string;
}

interface AlbumTracksProps {
  album?: string;
  artist?: string;
  tracks: Track[];
  currentId?: string;
  onPlay?: (id: string) => void;
}

export const AlbumTracks: FC<AlbumTracksProps> = ({
  album,
  artist,
  tracks,
  currentId,
  onPlay,
}) => (
  <div className="flex flex-col" data-testid="album-tracks">
    {album && (
      <div className="px-4 pt-2">
        <h3 className="card-title text-base">{album}</h3>
      </div>
    )}
    {tracks.map((track, index) => {
      const isCurrent = track.id === currentId;
      return (
        <div
          key={track.id}
          data-testid="album-track"
          className={`flex items-center gap-3 px-4 py-2 transition-colors ${
            isCurrent ? 'bg-primary/10' : 'hover:bg-base-200'
          }`}>
          <span className="text-base-content/50 w-8 text-center text-sm">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-sm ${
                isCurrent ? 'text-primary font-semibold' : ''
              }`}>
              {track.title}
            </p>
            {artist && (
              <p className="text-base-content/50 truncate text-xs">{artist}</p>
            )}
          </div>
          <span className="text-base-content/50 text-xs">{track.duration}</span>
          <button
            type="button"
            aria-label={`Play ${track.title}`}
            className="btn btn-ghost btn-sm btn-circle"
            onClick={() => onPlay?.(track.id)}>
            ▶
          </button>
        </div>
      );
    })}
  </div>
);

AlbumTracks.displayName = 'AlbumTracks';
