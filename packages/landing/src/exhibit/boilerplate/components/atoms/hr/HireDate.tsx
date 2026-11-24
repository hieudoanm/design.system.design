import type { FC } from 'react';

interface HireDateProps {
  date: string | Date;
  format?: Intl.DateTimeFormatOptions;
  showIcon?: boolean;
}

export const HireDate: FC<HireDateProps> = ({
  date,
  format = { year: 'numeric', month: 'short', day: 'numeric' },
  showIcon = true,
}) => {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  const formatted = Number.isNaN(parsed.getTime())
    ? '—'
    : new Intl.DateTimeFormat(undefined, format).format(parsed);
  return (
    <span data-testid="hire-date" className="text-base-content/70 text-sm">
      {showIcon && (
        <span aria-hidden="true" className="mr-1">
          📅
        </span>
      )}
      {formatted}
    </span>
  );
};
