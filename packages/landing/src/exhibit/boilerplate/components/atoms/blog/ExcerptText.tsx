import type { FC } from 'react';

interface ExcerptTextProps {
  text: string;
  limit?: number;
  className?: string;
}

export const ExcerptText: FC<ExcerptTextProps> = ({
  text,
  limit = 40,
  className = '',
}) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const truncated =
    words.length > limit ? `${words.slice(0, limit).join(' ')}…` : text;
  return (
    <p
      data-testid="excerpt-text"
      className={`text-base-content/70 line-clamp-3 ${className}`}>
      {truncated}
    </p>
  );
};
