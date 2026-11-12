import type { FC } from 'react';

const Loading: FC = () => {
  return (
    <div className='mx-auto max-w-2xl py-24 text-center'>
      <p className='text-cobalt font-mono text-sm tracking-[0.2em] uppercase'>Loading</p>
      <h1 className='mt-4 text-4xl font-semibold tracking-tight sm:text-6xl'>Please wait</h1>
      <p className='text-mute mt-4 text-lg leading-relaxed'>Preparing your content...</p>
    </div>
  );
};

export default Loading;
