'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { FC } from 'react';

interface AnimatedCardProps {
  href: string;
  label: string;
  title: string;
  description: string;
  items: { slug: string; title: string }[];
  color: 'marker' | 'cobalt';
  index: number;
}

const AnimatedCard: FC<AnimatedCardProps> = ({
  href,
  label,
  title,
  description,
  items,
  color,
  index,
}) => {
  const colorClass = color === 'marker' ? 'text-marker' : 'text-cobalt';
  const bgClass = color === 'marker' ? 'bg-marker/10 text-marker' : 'bg-cobalt/10 text-cobalt';
  const borderClass = color === 'marker' ? 'hover:border-marker' : 'hover:border-cobalt';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}>
      <Link
        href={href}
        className={`group border-ink/15 ${borderClass} flex flex-col justify-between rounded-lg border bg-[var(--card-bg)] p-8 transition hover:-translate-y-1 hover:shadow-xl`}>
        <div>
          <p className={`${colorClass} font-mono text-sm`}>{label}</p>
          <h2 className='mt-2 text-3xl font-semibold tracking-tight'>{title}</h2>
          <p className='text-mute mt-3 text-lg leading-relaxed'>{description}</p>
        </div>
        <ol className='mt-8 flex flex-wrap gap-2'>
          {items.map((item, i) => (
            <motion.li
              key={item.slug}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 + i * 0.05 }}
              className={`${bgClass} rounded-full px-3 py-1 font-mono text-xs`}>
              {item.title}
            </motion.li>
          ))}
        </ol>
      </Link>
    </motion.div>
  );
};

export default AnimatedCard;
