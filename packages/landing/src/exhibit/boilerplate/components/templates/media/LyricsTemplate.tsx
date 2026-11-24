'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const SONG = {
  title: 'Midnight Reverie',
  artist: 'Nova Ember',
  album: 'Horizon Line',
  duration: '3:45',
};

const LYRIC_LINES = [
  'Under a sky of violet static',
  'Dreams are made of midnight',
  'Every echo bends the light',
  'Chasing the signal, burning bright',
  'We glow against the fading night',
];

export const LyricsTemplate: FC = () => {
  const [showLyrics, setShowLyrics] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Lyrics</h1>
        <p className="text-base-content/50 mt-1 text-sm">Sing along.</p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-3 p-6">
            <p className="text-lg font-bold tracking-tight">{SONG.title}</p>
            <p className="text-base-content/50 text-sm">{SONG.artist}</p>
            <p className="text-base-content/50 text-sm">{SONG.album}</p>
            <p className="text-base-content/50 text-sm">{SONG.duration}</p>
            <div className="mt-2">
              <button
                onClick={() => setShowLyrics((prev) => !prev)}
                className="btn btn-outline btn-sm gap-1">
                {showLyrics ? <FiChevronUp /> : <FiChevronDown />}
                {showLyrics ? 'Hide lyrics' : 'Show lyrics'}
              </button>
            </div>
            {showLyrics && (
              <div className="bg-base-300/60 rounded-xl p-5">
                {LYRIC_LINES.map((line) => (
                  <p
                    key={line}
                    className="text-base-content/70 text-sm leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

LyricsTemplate.displayName = 'LyricsTemplate';
