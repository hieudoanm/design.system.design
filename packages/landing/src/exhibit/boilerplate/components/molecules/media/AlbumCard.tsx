import type { FC } from 'react';

interface AlbumCardProps {
  title: string;
  artist: string;
  year?: string;
  trackCount?: number;
  coverUrl?: string;
  onOpen?: () => void;
}

export const AlbumCard: FC<AlbumCardProps> = ({
  title,
  artist,
  year,
  trackCount,
  coverUrl,
  onOpen,
}) => (
  <button
    type="button"
    onClick={onOpen}
    data-testid="album-card"
    className="card bg-base-200 text-left transition-transform hover:-translate-y-0.5">
    <figure className="aspect-square w-full">
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="bg-base-content/10 flex h-full w-full items-center justify-center text-4xl">
          💿
        </div>
      )}
    </figure>
    <div className="card-body gap-1 p-4">
      <h3 className="card-title text-base">{title}</h3>
      <p className="text-base-content/50 text-sm">
        {artist}
        {year && ` · ${year}`}
        {trackCount !== undefined && ` · ${trackCount} tracks`}
      </p>
    </div>
  </button>
);

AlbumCard.displayName = 'AlbumCard';
