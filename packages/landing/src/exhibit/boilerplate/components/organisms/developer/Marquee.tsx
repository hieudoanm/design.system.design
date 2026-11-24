'use client';

import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';

interface MarqueeProps {
  items: ReactNode[];
  title?: string;
  className?: string;
}

export const Marquee: FC<MarqueeProps> = ({ items, title, className = '' }) => (
  <div className={className}>
    {title && <h2 className="mb-4 text-center text-2xl">{title}</h2>}
    <div className="border-base-content/10 overflow-hidden border-y py-4">
      <motion.div
        data-testid="marquee-track"
        className="flex w-max gap-8 pr-8"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 24, ease: 'linear', repeat: Infinity }}>
        {[...items, ...items].map((item, index) => (
          <div
            key={index}
            className="text-base-content/50 flex shrink-0 items-center gap-2 text-lg">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  </div>
);
