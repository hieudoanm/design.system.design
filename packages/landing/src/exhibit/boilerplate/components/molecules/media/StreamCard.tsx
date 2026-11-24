import type { FC } from 'react';

interface StreamCardProps {
  title: string;
  platform: string;
  status?: 'live' | 'offline' | 'scheduled';
  viewers?: number;
  thumbnailUrl?: string;
  onWatch?: () => void;
}

const badgeClass: Record<NonNullable<StreamCardProps['status']>, string> = {
  live: 'badge-error',
  scheduled: 'badge-warning',
  offline: 'badge-neutral',
};

export const StreamCard: FC<StreamCardProps> = ({
  title,
  platform,
  status = 'offline',
  viewers,
  thumbnailUrl,
  onWatch,
}) => (
  <button
    type="button"
    onClick={onWatch}
    data-testid="stream-card"
    className="card bg-base-200 text-left transition-transform hover:-translate-y-0.5">
    <figure className="relative h-36">
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="bg-base-content/10 flex h-full w-full items-center justify-center text-4xl">
          🎬
        </div>
      )}
      <span
        className={`badge badge-xs absolute top-2 left-2 ${badgeClass[status]}`}>
        {status}
      </span>
      {viewers !== undefined && status === 'live' && (
        <span className="badge badge-ghost badge-xs absolute top-2 right-2">
          👁 {viewers.toLocaleString()}
        </span>
      )}
    </figure>
    <div className="card-body gap-1 p-4">
      <h3 className="card-title text-sm">{title}</h3>
      <p className="text-base-content/50 text-xs">{platform}</p>
    </div>
  </button>
);

StreamCard.displayName = 'StreamCard';
