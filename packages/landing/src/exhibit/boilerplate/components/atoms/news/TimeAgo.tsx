import type { FC } from 'react';

interface TimeAgoProps {
  date: string | Date;
  now?: string | Date;
}

const timeAgo = (date: Date, now: Date): string => {
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - date.getTime()) / 1000)
  );
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export const TimeAgo: FC<TimeAgoProps> = ({ date, now }) => {
  const target = new Date(date);
  const reference = now ? new Date(now) : new Date();
  return (
    <time
      dateTime={target.toISOString()}
      className="text-base-content/50 text-xs"
      data-testid="time-ago">
      {timeAgo(target, reference)}
    </time>
  );
};
