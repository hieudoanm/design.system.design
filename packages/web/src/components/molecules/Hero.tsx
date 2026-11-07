'use client';

import { motion } from 'motion/react';
import type { FC } from 'react';

/** The animated headline and lede of the landing page. */
const Hero: FC = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='pt-6 pb-16'>
      <p className='text-mute font-mono text-sm tracking-[0.2em] uppercase'>
        Two subjects, one word apart
      </p>
      <h1 className='mt-5 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-tight sm:text-7xl'>
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='text-marker'>
          Design
        </motion.span>{' '}
        system.
        <br />
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='text-cobalt'>
          System
        </motion.span>{' '}
        design.
      </h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className='text-mute mt-8 max-w-2xl text-xl leading-relaxed'>
        Same two words, opposite order, very different jobs. Use the toggle at the top: the left
        button opens how to build a good design system, the right button opens how to answer system
        design interview questions.
      </motion.p>
    </motion.section>
  );
};

export default Hero;
