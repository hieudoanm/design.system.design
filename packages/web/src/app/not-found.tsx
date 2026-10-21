import Link from 'next/link';
import type { NextPage } from 'next';

const NotFound: NextPage = () => {
  return (
    <div className='mx-auto max-w-2xl py-24 text-center'>
      <p className='text-marker font-mono text-sm tracking-[0.2em] uppercase'>404</p>
      <h1 className='mt-4 text-4xl font-semibold tracking-tight sm:text-6xl'>Page not found</h1>
      <p className='text-mute mt-4 text-lg leading-relaxed'>
        The page you are looking for does not exist or has been moved.
      </p>
      <div className='mt-10 flex flex-wrap items-center justify-center gap-4'>
        <Link
          href='/'
          className='border-ink/20 hover:border-marker hover:text-marker rounded-full border px-5 py-2 text-sm transition'>
          Return home
        </Link>
        <Link
          href='/design-system'
          className='border-ink/20 hover:border-marker hover:text-marker rounded-full border px-5 py-2 text-sm transition'>
          Design System
        </Link>
        <Link
          href='/system-design'
          className='border-ink/20 hover:border-cobalt hover:text-cobalt rounded-full border px-5 py-2 text-sm transition'>
          System Design
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
