'use client';

import { withBasePath } from '@/lib/paths';
import { useEffect, type FC } from 'react';

const GlobalError: FC<{ error: Error & { digest?: string }; reset: () => void }> = ({
  error,
  reset,
}) => {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className='mx-auto max-w-2xl py-24 text-center'>
          <p className='text-marker font-mono text-sm tracking-[0.2em] uppercase'>Critical Error</p>
          <h1 className='mt-4 text-4xl font-semibold tracking-tight sm:text-6xl'>
            Something went seriously wrong
          </h1>
          <p className='text-mute mt-4 text-lg leading-relaxed'>
            A critical error occurred at the root level. Please try refreshing the page.
          </p>
          <div className='mt-10 flex flex-wrap items-center justify-center gap-4'>
            <button
              onClick={() => reset()}
              className='border-ink/20 hover:border-marker hover:text-marker rounded-full border px-5 py-2 text-sm transition'>
              Try again
            </button>
            <a
              href={withBasePath('/')}
              className='border-ink/20 hover:border-cobalt hover:text-cobalt rounded-full border px-5 py-2 text-sm transition'>
              Return home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
};

export default GlobalError;
