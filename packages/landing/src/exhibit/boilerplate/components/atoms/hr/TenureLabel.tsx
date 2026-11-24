import type { FC } from 'react';

interface TenureLabelProps {
  years: number;
  months?: number;
}

const pluralize = (value: number, unit: string): string =>
  `${value} ${unit}${value === 1 ? '' : 's'}`;

export const TenureLabel: FC<TenureLabelProps> = ({ years, months = 0 }) => {
  const parts: string[] = [];
  if (years > 0) parts.push(pluralize(years, 'year'));
  if (months > 0) parts.push(pluralize(months, 'month'));
  return (
    <span data-testid="tenure-label" className="text-base-content/60 text-sm">
      {parts.length > 0 ? parts.join(' ') : 'New hire'}
    </span>
  );
};
