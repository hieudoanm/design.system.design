'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { IndexItem } from '../templates/TopicsTemplate';

interface IndexCardProps {
  item: IndexItem;
  basePath: string;
  style: {
    hoverBorderClass: string;
  };
  renderTitleAccessory?: (item: IndexItem) => React.ReactNode;
  index: number;
  color: 'marker' | 'cobalt';
}

const IndexCard: FC<IndexCardProps> = ({
  item,
  basePath,
  style,
  renderTitleAccessory,
  index,
  color,
}) => {
  const badgeTextClass = color === 'marker' ? 'text-marker' : 'text-cobalt';
  const badgeBgClass = color === 'marker' ? 'bg-marker/10' : 'bg-cobalt/10';
  const tagClass =
    color === 'marker'
      ? 'text-marker bg-marker/10 rounded-full px-2.5 py-0.5 font-mono text-xs'
      : 'bg-cobalt/10 text-cobalt rounded-full px-2.5 py-0.5 font-mono text-xs';

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}>
      <Link
        href={`${basePath}/${item.slug}`}
        className={`border-ink/15 ${style.hoverBorderClass} flex h-full flex-col justify-between rounded-lg border bg-[var(--card-bg)] p-6 transition hover:-translate-y-1 hover:shadow-xl`}>
        <div>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='text-2xl font-semibold tracking-tight'>{item.title}</h3>
            {renderTitleAccessory ? renderTitleAccessory(item) : null}
          </div>
          <p className='text-mute mt-2 leading-relaxed'>{item.tagline}</p>
        </div>
        <ul className='mt-5 flex flex-wrap gap-2'>
          {item.sections.map((section, i) => (
            <motion.li
              key={section.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 + i * 0.03 }}
              className={`${badgeTextClass} ${badgeBgClass} rounded-full px-2.5 py-0.5 font-mono text-xs`}>
              {section.title}
            </motion.li>
          ))}
          {'tags' in item && item.tags?.length
            ? item.tags.map((tag, i) => (
                <motion.li
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05 + (item.sections.length + i) * 0.03,
                  }}
                  className={tagClass}>
                  {tag}
                </motion.li>
              ))
            : null}
        </ul>
      </Link>
    </motion.li>
  );
};

export default IndexCard;
