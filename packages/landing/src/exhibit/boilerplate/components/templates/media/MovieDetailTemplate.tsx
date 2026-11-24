'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock, FiHeart, FiPause, FiPlay, FiStar } from 'react-icons/fi';

const TITLE = 'Starfall Protocol';
const YEAR = '2026';
const DURATION = '2h 10m';
const RATING = '4.8';
const GENRES = ['Sci-Fi', 'Action', 'Thriller'];

const SYNOPSIS = [
  'A deep-space crew intercepts a signal that appears to rewrite the laws of physics.',
  'As the anomaly grows aboard the ship, the team must choose between survival and discovery.',
  'Their journey pushes the boundaries of time, memory, and what it means to return home.',
];

export const MovieDetailTemplate: FC = () => {
  const [paused, setPaused] = useState(true);
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Movie</h1>
        <p className="text-base-content/50 mt-1 text-sm">Movie details.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              {GENRES.map((genre) => (
                <span key={genre} className="badge badge-info badge-sm">
                  {genre}
                </span>
              ))}
            </div>

            <div>
              <p className="text-xl font-semibold">{TITLE}</p>
              <p className="text-base-content/50 flex flex-wrap items-center gap-3 text-sm">
                <span>{YEAR}</span>
                <span className="flex items-center gap-1">
                  <FiClock />
                  {DURATION}
                </span>
                <span className="flex items-center gap-1">
                  <FiStar />
                  {RATING} rating
                </span>
              </p>
            </div>

            <div className="bg-base-100/50 rounded-lg p-4">
              {SYNOPSIS.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setPaused((prev) => !prev)}
                className="btn btn-primary btn-sm gap-1">
                {paused ? <FiPlay /> : <FiPause />}
                {paused ? 'Play' : 'Paused'}
              </button>
              <button
                onClick={() => setLiked((prev) => !prev)}
                className="btn btn-outline btn-sm gap-1">
                <FiHeart />
                {liked ? 'Liked' : 'Like'}
              </button>
              {liked && (
                <span className="badge badge-error badge-sm">Liked</span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

MovieDetailTemplate.displayName = 'MovieDetailTemplate';
