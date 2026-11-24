import type { FC } from 'react';

interface ArtistCardProps {
  name: string;
  imageUrl?: string;
  followers?: string;
  verified?: boolean;
  onOpen?: () => void;
}

export const ArtistCard: FC<ArtistCardProps> = ({
  name,
  imageUrl,
  followers,
  verified = false,
  onOpen,
}) => (
  <button
    type="button"
    onClick={onOpen}
    data-testid="artist-card"
    className="card bg-base-200 items-center text-center transition-transform hover:-translate-y-0.5">
    <figure className="px-4 pt-4">
      <div className="avatar">
        <div className="h-24 w-24 rounded-full">
          {imageUrl ? (
            <img src={imageUrl} alt={name} />
          ) : (
            <div className="bg-primary text-primary-content flex h-full w-full items-center justify-center text-2xl font-semibold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </figure>
    <div className="card-body gap-1 p-4">
      <h3 className="card-title justify-center text-base">
        {name}
        {verified && <span className="badge badge-primary badge-xs">✓</span>}
      </h3>
      {followers && (
        <p className="text-base-content/50 text-sm">{followers} followers</p>
      )}
    </div>
  </button>
);

ArtistCard.displayName = 'ArtistCard';
