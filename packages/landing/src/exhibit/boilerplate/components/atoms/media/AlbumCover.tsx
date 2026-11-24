import type { FC } from 'react';

interface AlbumCoverProps {
  title: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-16 w-16 text-sm',
  md: 'h-24 w-24 text-base',
  lg: 'h-32 w-32 text-lg',
} as const;

const getInitials = (title: string): string =>
  title
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const AlbumCover: FC<AlbumCoverProps> = ({
  title,
  src,
  size = 'md',
  className = '',
}) => (
  <div
    data-testid="album-cover"
    className={`bg-base-200 flex items-center justify-center overflow-hidden rounded-lg ${sizeClasses[size]} ${className}`}>
    {src ? (
      <img
        src={src}
        alt={`${title} cover`}
        className="h-full w-full object-cover"
      />
    ) : (
      <span className="text-base-content/70 font-medium">
        {getInitials(title)}
      </span>
    )}
  </div>
);
