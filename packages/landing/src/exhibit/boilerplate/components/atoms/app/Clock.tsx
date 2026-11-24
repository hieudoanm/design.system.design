'use client';

import { useEffect, useState } from 'react';
import type { FC } from 'react';

interface ClockProps {
  format?: '12h' | '24h';
  showSeconds?: boolean;
  className?: string;
}

const pad = (value: number): string => String(value).padStart(2, '0');

export const Clock: FC<ClockProps> = ({
  format = '24h',
  showSeconds = true,
  className = '',
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  let hours = now.getHours();
  let suffix = '';
  if (format === '12h') {
    suffix = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12 || 12;
  }
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const time = showSeconds
    ? `${pad(hours)}:${minutes}:${seconds}`
    : `${pad(hours)}:${minutes}`;

  return (
    <time className={`font-mono text-2xl tabular-nums ${className}`}>
      {time}
      {suffix}
    </time>
  );
};
