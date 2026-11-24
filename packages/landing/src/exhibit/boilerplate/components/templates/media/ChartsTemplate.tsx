'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiTrendingUp } from 'react-icons/fi';

type ChartPeriod = 'Weekly' | 'Monthly' | 'Yearly';

interface ChartSong {
  rank: number;
  title: string;
  artist: string;
  plays: string;
  movement: 'Up' | 'Down';
}

const WEEKLY: ChartSong[] = [
  {
    rank: 1,
    title: 'Solar Flare',
    artist: 'Luna Vega',
    plays: '3.2M',
    movement: 'Up',
  },
  {
    rank: 2,
    title: 'Concrete Waves',
    artist: 'The Afterglow',
    plays: '2.8M',
    movement: 'Up',
  },
  {
    rank: 3,
    title: 'Velvet Static',
    artist: 'Kaito Rei',
    plays: '2.1M',
    movement: 'Down',
  },
  {
    rank: 4,
    title: 'Cherry Cola',
    artist: 'Juno Park',
    plays: '1.9M',
    movement: 'Up',
  },
  {
    rank: 5,
    title: 'Silver Lining',
    artist: 'Maya Fields',
    plays: '1.2M',
    movement: 'Down',
  },
];

const MONTHLY: ChartSong[] = [
  {
    rank: 1,
    title: 'Neon Dreams',
    artist: 'Nova Ember',
    plays: '8.4M',
    movement: 'Up',
  },
  {
    rank: 2,
    title: 'Golden Hour',
    artist: 'Aria Wells',
    plays: '7.9M',
    movement: 'Up',
  },
  {
    rank: 3,
    title: 'City Lights',
    artist: 'The Midnight Echo',
    plays: '6.5M',
    movement: 'Down',
  },
  {
    rank: 4,
    title: 'Open Road',
    artist: 'Delta Rivers',
    plays: '5.2M',
    movement: 'Up',
  },
  {
    rank: 5,
    title: 'Wildflower',
    artist: 'Juno Park',
    plays: '4.8M',
    movement: 'Down',
  },
  {
    rank: 6,
    title: 'Slow Motion',
    artist: 'Cora Lane',
    plays: '3.6M',
    movement: 'Up',
  },
];

const YEARLY: ChartSong[] = [
  {
    rank: 1,
    title: 'Midnight Static',
    artist: 'Kaito Rei',
    plays: '41.2M',
    movement: 'Down',
  },
  {
    rank: 2,
    title: 'Paper Planes',
    artist: 'The Afterglow',
    plays: '38.7M',
    movement: 'Up',
  },
  {
    rank: 3,
    title: 'Neon Tides',
    artist: 'Luna Vega',
    plays: '36.9M',
    movement: 'Up',
  },
  {
    rank: 4,
    title: 'Starlight Avenue',
    artist: 'Maya Fields',
    plays: '29.4M',
    movement: 'Down',
  },
];

const CHARTS: Record<ChartPeriod, ChartSong[]> = {
  Weekly: WEEKLY,
  Monthly: MONTHLY,
  Yearly: YEARLY,
};

const MOVEMENT_ICONS = {
  Up: FiChevronUp,
  Down: FiChevronDown,
} as const;

const MovementBadge = ({ movement }: { movement: 'Up' | 'Down' }) => {
  const Icon = MOVEMENT_ICONS[movement];
  return (
    <span
      className={`badge badge-sm ${
        movement === 'Up' ? 'badge-success' : 'badge-error'
      }`}>
      <Icon />
      {movement}
    </span>
  );
};

export const ChartsTemplate: FC = () => {
  const [period, setPeriod] = useState<ChartPeriod>('Weekly');

  const songs = CHARTS[period];

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Charts</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Top songs this week.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {(Object.keys(CHARTS) as ChartPeriod[]).map((item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`tab ${period === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">{songs.length} songs</p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {songs.map((song) => (
              <div
                key={song.title}
                className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
                <span className="text-base-content/50 w-6 text-center text-sm font-medium">
                  {song.rank}
                </span>
                <FiTrendingUp className="text-base-content/30 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{song.title}</p>
                  <p className="text-base-content/50 text-xs">{song.artist}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-base-content/50 text-xs">
                    {song.plays} plays
                  </span>
                  <MovementBadge movement={song.movement} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

ChartsTemplate.displayName = 'ChartsTemplate';
