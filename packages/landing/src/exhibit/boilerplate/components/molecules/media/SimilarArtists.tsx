import type { FC } from 'react';

interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
  followers?: string;
}

interface SimilarArtistsProps {
  artists: Artist[];
  onSelect?: (id: string) => void;
}

export const SimilarArtists: FC<SimilarArtistsProps> = ({
  artists,
  onSelect,
}) => (
  <div className="flex flex-col gap-2" data-testid="similar-artists">
    {artists.map((artist) => (
      <button
        key={artist.id}
        type="button"
        onClick={() => onSelect?.(artist.id)}
        className="hover:bg-base-200 flex items-center gap-3 rounded-lg px-3 py-2 text-left">
        <div className="avatar">
          <div className="h-10 w-10 rounded-full">
            {artist.imageUrl ? (
              <img src={artist.imageUrl} alt={artist.name} />
            ) : (
              <div className="bg-primary text-primary-content flex h-full w-full items-center justify-center text-sm font-semibold">
                {artist.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{artist.name}</p>
          {artist.followers && (
            <p className="text-base-content/50 text-xs">
              {artist.followers} followers
            </p>
          )}
        </div>
      </button>
    ))}
  </div>
);

SimilarArtists.displayName = 'SimilarArtists';
