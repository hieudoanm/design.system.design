import type { FC } from 'react';

interface DateStampProps {
  date: string;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const formatDate = (date: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  if (!match) return date;
  const year = match[1];
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (month < 1 || month > 12) return date;
  return `${MONTHS[month - 1]} ${day}, ${year}`;
};

export const DateStamp: FC<DateStampProps> = ({ date }) => (
  <time
    dateTime={date}
    data-testid="date-stamp"
    className="text-base-content/60 text-sm">
    {formatDate(date)}
  </time>
);
