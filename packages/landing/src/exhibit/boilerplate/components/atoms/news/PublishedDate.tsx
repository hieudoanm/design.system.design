import type { FC } from 'react';

interface PublishedDateProps {
  date: string | Date;
  format?: 'full' | 'short' | 'iso';
}

const formatDate = (date: Date, format: string): string => {
  if (format === 'iso') return date.toISOString();
  if (format === 'short')
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const PublishedDate: FC<PublishedDateProps> = ({
  date,
  format = 'full',
}) => {
  const target = new Date(date);
  return (
    <time
      dateTime={target.toISOString()}
      className="text-base-content/50 flex items-center gap-1 text-sm"
      data-testid="published-date">
      <span aria-hidden>🗓</span>
      {formatDate(target, format)}
    </time>
  );
};
