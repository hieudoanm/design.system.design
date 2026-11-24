'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCalendar, FiCpu, FiPause, FiPlay, FiStar } from 'react-icons/fi';

interface Game {
  title: string;
  developer: string;
  year: number;
  rating: string;
  genres: string[];
}

const GAME: Game = {
  title: 'Stellar Vanguard',
  developer: 'Aurora Interactive',
  year: 2026,
  rating: '4.7',
  genres: ['Action', 'Sci-Fi', 'Multiplayer'],
};

export const GameDetailTemplate: FC = () => {
  const [playing, setPlaying] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Game</h1>
        <p className="text-base-content/50 mt-1 text-sm">Game details.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              {GAME.genres.map((genre) => (
                <span key={genre} className="badge badge-info badge-sm">
                  {genre}
                </span>
              ))}
            </div>

            <div>
              <p className="text-xl font-semibold">{GAME.title}</p>
              <p className="text-base-content/50 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <FiCpu />
                  {GAME.developer}
                </span>
                <span className="flex items-center gap-1">
                  <FiCalendar />
                  {GAME.year}
                </span>
                <span className="flex items-center gap-1">
                  <FiStar />
                  {GAME.rating} rating
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setPlaying((prev) => !prev)}
                className="btn btn-primary btn-sm gap-1">
                {playing ? <FiPause /> : <FiPlay />}
                {playing ? 'Paused' : 'Play'}
              </button>
              <button
                onClick={() => setWishlisted((prev) => !prev)}
                className="btn btn-outline btn-sm">
                {wishlisted ? 'Wishlisted' : 'Wishlist'}
              </button>
              {wishlisted && (
                <span className="badge badge-info badge-sm">Wishlisted</span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

GameDetailTemplate.displayName = 'GameDetailTemplate';
