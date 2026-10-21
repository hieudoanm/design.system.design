'use client';

import Rich from '../atoms/Rich';
import { motion } from 'motion/react';
import type { FC } from 'react';

export type QaItem = { q: string; a: string };

/** Question and answer list built on native <details>: no client JS needed. */
const Qa: FC<{ items: QaItem[] }> = ({ items }) => {
  return (
    <div className='divide-ink/15 border-ink/15 divide-y border-y'>
      {items.map((item, index) => (
        <motion.details
          key={item.q}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className='group'>
          <summary className='hover:text-marker flex cursor-pointer list-none items-start gap-4 py-4 pr-1 text-left marker:content-none [&::-webkit-details-marker]:hidden'>
            <span className='flex-1 text-lg leading-snug font-medium'>{item.q}</span>
            <motion.span
              aria-hidden
              className='text-mute mt-0.5 text-2xl leading-none transition-transform duration-300 group-open:rotate-45'>
              +
            </motion.span>
          </summary>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className='text-ink/85 max-w-3xl space-y-3 pr-8 pb-6 text-[1.0625rem] leading-relaxed'>
            <Rich text={item.a} />
          </motion.div>
        </motion.details>
      ))}
    </div>
  );
};

export default Qa;
