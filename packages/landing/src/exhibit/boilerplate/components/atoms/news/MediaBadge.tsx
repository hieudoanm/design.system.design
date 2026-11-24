import type { FC } from 'react';

type MediaType = 'photo' | 'video' | 'live' | 'audio';

interface MediaBadgeProps {
  type: MediaType;
}

const mediaConfig: Record<MediaType, { icon: string; className: string }> = {
  photo: { icon: '📷', className: 'badge-neutral' },
  video: { icon: '🎬', className: 'badge-info' },
  live: { icon: '🔴', className: 'badge-error' },
  audio: { icon: '🎧', className: 'badge-accent' },
};

export const MediaBadge: FC<MediaBadgeProps> = ({ type }) => {
  const { icon, className } = mediaConfig[type];
  return (
    <span
      className={`badge badge-sm gap-1 ${className}`}
      data-testid="media-badge">
      <span aria-hidden>{icon}</span>
      {type}
    </span>
  );
};
