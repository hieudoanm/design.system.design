'use client';

import dynamic from 'next/dynamic';
import { type FC, Suspense } from 'react';
import { ExhibitFrame } from './frame';

/*
 * One lazy chunk per app so an exhibit page only ships the demo it shows.
 * Each entry is the app's own main page, providers included.
 */
const demos = {
  pos: dynamic(() => import('./demos/pos')),
  menu: dynamic(() => import('./demos/menu')),
  wallet: dynamic(() => import('./demos/wallet')),
  tax: dynamic(() => import('./demos/tax')),
  chat: dynamic(() => import('./demos/chat')),
  ai: dynamic(() => import('./demos/ai')),
  password: dynamic(() => import('./demos/password')),
  video: dynamic(() => import('./demos/video')),
  gallery: dynamic(() => import('./demos/gallery')),
} as const;

export type ExhibitDemoSlug = keyof typeof demos;

export const ExhibitDemo: FC<{ slug: ExhibitDemoSlug }> = ({ slug }) => {
  const Demo = demos[slug];
  return (
    <ExhibitFrame className='border-ink/15 overflow-hidden rounded-xl border'>
      <Suspense
        fallback={
          <div className='text-mute flex h-48 items-center justify-center text-sm'>
            Loading exhibit…
          </div>
        }>
        <Demo />
      </Suspense>
    </ExhibitFrame>
  );
};
