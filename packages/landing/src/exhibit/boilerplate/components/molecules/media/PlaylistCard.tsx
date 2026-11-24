import type { FC } from 'react';

interface PlaylistCardProps {
  title: string;
  trackCount: number;
  author?: string;
  coverUrl?: string;
  onOpen?: () => void;
}

export const PlaylistCard: FC<PlaylistCardProps> = ({
  title,
  trackCount,
  author,
  coverUrl,
  onOpen,
}) => (
  <button
    type="button"
    onClick={onOpen}
    data-testid="playlist-card"
    className="card bg-base-200 text-left transition-transform hover:-translate-y-0.5">
    <figure className="h-36">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="bg-base-content/10 flex h-full w-full items-center justify-center text-4xl">
          🎵
        </div>
      )}
    </figure>
    <div className="card-body gap-1 p-4">
      <h3 className="card-title text-base">{title}</h3>
      <p className="text-base-content/50 text-sm">
        {author && `${author} · `}
        {trackCount} tracks
      </p>
    </div>
  </button>
);

PlaylistCard.displayName = 'PlaylistCard';
