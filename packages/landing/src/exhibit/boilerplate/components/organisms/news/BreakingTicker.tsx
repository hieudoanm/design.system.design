'use client';

import { useEffect, useState } from 'react';
import type { FC } from 'react';

interface BreakingTickerProps {
  items: string[];
  label?: string;
  intervalMs?: number;
}

export const BreakingTicker: FC<BreakingTickerProps> = ({
  items,
  label = 'Breaking',
  intervalMs = 4000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, intervalMs]);

  return (
    <div
      data-testid="breaking-ticker"
      className="flex w-full items-stretch gap-3">
      <span className="badge badge-error flex shrink-0 items-center gap-2 px-3 text-sm">
        <span className="relative flex h-2 w-2">
          <span className="bg-base-content absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
          <span className="bg-base-content relative inline-flex h-2 w-2 rounded-full" />
        </span>
        {label}
      </span>
      <div className="border-base-content/10 flex-1 overflow-hidden rounded-lg border">
        <div
          data-testid="breaking-ticker-track"
          className="ticker-scroll flex w-max items-center gap-10 py-2">
          {items.map((item, index) => (
            <span
              key={index}
              data-active={index === activeIndex}
              className={`text-sm whitespace-nowrap ${
                index === activeIndex
                  ? 'text-primary font-semibold'
                  : 'text-base-content/70'
              }`}>
              {item}
            </span>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .ticker-scroll {
          animation: ticker-scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
};
