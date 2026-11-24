import type { FC } from 'react';

interface LibrarySong {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
}

interface MusicLibraryProps {
  songs: LibrarySong[];
  title?: string;
  onPlay?: (id: string) => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
};

export const MusicLibrary: FC<MusicLibraryProps> = ({
  songs,
  title = 'Your library',
  onPlay,
}) => {
  return (
    <section data-testid="music-library" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-base-content/50 text-sm">{songs.length} songs</p>
      </div>
      <div className="bg-base-200 overflow-x-auto rounded-xl">
        <table className="table-zebra table-compact table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Album</th>
              <th className="text-right">Duration</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {songs.map((song, index) => (
              <tr key={song.id}>
                <td className="text-base-content/40">{index + 1}</td>
                <td>
                  <p className="font-medium">{song.title}</p>
                  <p className="text-base-content/50 text-xs">{song.artist}</p>
                </td>
                <td className="text-base-content/60">{song.album}</td>
                <td className="text-base-content/60 text-right">
                  {formatTime(song.duration)}
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    aria-label={`Play ${song.title}`}
                    onClick={() => onPlay?.(song.id)}>
                    &#9654;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
