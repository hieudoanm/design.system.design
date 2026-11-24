import type { FC } from 'react';

interface ArtistInitialsProps {
  name: string;
  className?: string;
}

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const ArtistInitials: FC<ArtistInitialsProps> = ({
  name,
  className = '',
}) => (
  <span
    data-testid="artist-initials"
    className={`text-sm font-medium ${className}`}>
    {getInitials(name)}
  </span>
);
