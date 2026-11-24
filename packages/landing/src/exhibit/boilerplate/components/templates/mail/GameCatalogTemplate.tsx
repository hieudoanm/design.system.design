'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiGrid, FiSearch, FiStar } from 'react-icons/fi';

type Genre = 'Action' | 'RPG' | 'Strategy';
type GenreFilter = 'All' | Genre;

interface Game {
  id: string;
  title: string;
  genre: Genre;
  rating: string;
  players: string;
}

const GAMES: Game[] = [
  {
    id: 'g1',
    title: 'Stellar Vanguard',
    genre: 'Action',
    rating: '4.8',
    players: '2.4M',
  },
  {
    id: 'g2',
    title: 'Ironforge Realms',
    genre: 'RPG',
    rating: '4.6',
    players: '1.8M',
  },
  {
    id: 'g3',
    title: 'Phantom Ops',
    genre: 'Action',
    rating: '4.7',
    players: '1.2M',
  },
  {
    id: 'g4',
    title: 'Kingdom Tactics',
    genre: 'Strategy',
    rating: '4.5',
    players: '940K',
  },
  {
    id: 'g5',
    title: 'Nova Online',
    genre: 'RPG',
    rating: '4.4',
    players: '3.1M',
  },
  {
    id: 'g6',
    title: 'Command Axis',
    genre: 'Strategy',
    rating: '4.3',
    players: '620K',
  },
];

const FILTERS: GenreFilter[] = ['All', 'Action', 'RPG', 'Strategy'];

export const GameCatalogTemplate: FC = () => {
  const [genre, setGenre] = useState<GenreFilter>('All');
  const [query, setQuery] = useState('');

  const visible = GAMES.filter((game) => {
    const matchesGenre = genre === 'All' || game.genre === genre;
    const matchesQuery = game.title
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return matchesGenre && matchesQuery;
  });

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Game Catalog</h1>
        <p className="text-base-content/50 mt-1 text-sm">Browse every title.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <FiSearch className="text-base-content/50 absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              aria-label="Search games"
              placeholder="Search games..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input input-bordered input-sm w-full pl-9"
            />
          </div>
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setGenre(item)}
                className={`tab ${genre === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <p className="text-base-content/50 mb-4 text-sm">
          {visible.length} games
        </p>

        {visible.length === 0 ? (
          <p className="text-base-content/50 py-10 text-center text-sm">
            No games found
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {visible.map((game) => (
              <div
                key={game.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body gap-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{game.title}</p>
                    <span className="badge badge-info badge-sm gap-1">
                      <FiGrid />
                      {game.genre}
                    </span>
                  </div>
                  <div className="text-base-content/50 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <FiStar />
                      {game.rating} rating
                    </span>
                    <span>{game.players} players</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

GameCatalogTemplate.displayName = 'GameCatalogTemplate';
