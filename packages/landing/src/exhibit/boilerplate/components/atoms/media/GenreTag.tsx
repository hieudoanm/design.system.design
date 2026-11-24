import type { FC } from 'react';

interface GenreTagProps {
  genre: string;
  className?: string;
}

export const GenreTag: FC<GenreTagProps> = ({ genre, className = '' }) => (
  <span
    data-testid="genre-tag"
    className={`badge badge-outline badge-sm ${className}`}>
    {genre}
  </span>
);
