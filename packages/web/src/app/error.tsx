'use client';

import { withBasePath } from '@/lib/paths';
import logger from '@/lib/log';
import { useEffect } from 'react';
import type { FC } from 'react';

const Error: FC<{ error: Error & { digest?: string }; reset: () => void }> = ({ error, reset }) => {
  useEffect(() => {
    logger.error(error);
  }, [error]);

  return (
    <div className='mx-auto max-w-2xl py-24 text-center'>
      <p className='text-cobalt font-mono text-sm tracking-[0.2em] uppercase'>Error</p>
      <h1 className='mt-4 text-4xl font-semibold tracking-tight sm:text-6xl'>
        Something went wrong
      </h1>
      <p className='text-mute mt-4 text-lg leading-relaxed'>
        An unexpected error occurred. You can try again or return home.
      </p>
      <div className='mt-10 flex flex-wrap items-center justify-center gap-4'>
        <button
          onClick={() => reset()}
          className='border-ink/20 hover:border-cobalt hover:text-cobalt rounded-full border px-5 py-2 text-sm transition'>
          Try again
        </button>
        <a
          href={withBasePath('/')}
          className='border-ink/20 hover:border-marker hover:text-marker rounded-full border px-5 py-2 text-sm transition'>
          Return home
        </a>
      </div>
    </div>
  );
};

export default Error;
