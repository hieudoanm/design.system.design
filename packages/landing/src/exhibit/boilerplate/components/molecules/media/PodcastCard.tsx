import type { FC } from 'react';

interface PodcastCardProps {
  title: string;
  host?: string;
  episodes?: number;
  imageUrl?: string;
  onOpen?: () => void;
}

export const PodcastCard: FC<PodcastCardProps> = ({
  title,
  host,
  episodes,
  imageUrl,
  onOpen,
}) => (
  <button
    type="button"
    onClick={onOpen}
    data-testid="podcast-card"
    className="card bg-base-200 text-left transition-transform hover:-translate-y-0.5">
    <figure className="aspect-square w-full">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="bg-base-content/10 flex h-full w-full items-center justify-center text-4xl">
          🎙️
        </div>
      )}
    </figure>
    <div className="card-body gap-1 p-4">
      <h3 className="card-title text-base">{title}</h3>
      <p className="text-base-content/50 text-sm">
        {host && `${host} · `}
        {episodes !== undefined && `${episodes} episodes`}
      </p>
    </div>
  </button>
);

PodcastCard.displayName = 'PodcastCard';
