'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiHeart, FiMusic, FiPause, FiPlay } from 'react-icons/fi';

const SONG = {
  title: 'Starlight Avenue',
  artist: 'Maya Fields',
  album: 'Night Bloom',
  duration: '3:45',
};

export const NowPlayingTemplate: FC = () => {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Now Playing</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          What is on right now.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-3 p-6">
            <div className="bg-base-content/10 flex h-40 items-center justify-center rounded-xl">
              <FiMusic className="text-base-content/30 h-10 w-10" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">{SONG.title}</p>
              <p className="text-base-content/50 text-sm">{SONG.artist}</p>
            </div>
            <p className="text-base-content/50 text-sm">{SONG.album}</p>
            <p className="text-base-content/50 text-sm">{SONG.duration}</p>

            <div className="flex items-center gap-3">
              <progress
                className="progress progress-primary w-full"
                value={65}
                max={100}
              />
              <span className="text-base-content/50 text-xs">65%</span>
            </div>

            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {playing ? (
                  <span className="badge badge-success badge-sm">Playing</span>
                ) : (
                  <span className="badge badge-neutral badge-sm">Paused</span>
                )}
                <button
                  onClick={() => setPlaying((prev) => !prev)}
                  className="btn btn-primary btn-sm gap-1">
                  {playing ? <FiPause /> : <FiPlay />}
                  {playing ? 'Pause' : 'Play'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                {liked && (
                  <span className="badge badge-error badge-sm">Liked</span>
                )}
                <button
                  onClick={() => setLiked((prev) => !prev)}
                  className="btn btn-ghost btn-sm gap-1">
                  <FiHeart />
                  Like
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

NowPlayingTemplate.displayName = 'NowPlayingTemplate';
