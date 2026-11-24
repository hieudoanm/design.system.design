'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  start?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const CountUp: FC<CountUpProps> = ({
  end,
  duration = 1000,
  start,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const [value, setValue] = useState(start ?? 0);

  useEffect(() => {
    const from = start ?? 0;
    const steps = Math.max(1, Math.round(duration / 16));
    let tick = 0;

    const interval = window.setInterval(() => {
      tick += 1;
      const progress = Math.min(1, tick / steps);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (end - from) * eased);
      if (progress >= 1) window.clearInterval(interval);
    }, 16);

    return () => window.clearInterval(interval);
  }, [end, duration, start]);

  return (
    <span className={className}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
};

CountUp.displayName = 'CountUp';
