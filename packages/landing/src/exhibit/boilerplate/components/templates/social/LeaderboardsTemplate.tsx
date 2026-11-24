'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiAward, FiTrendingUp } from 'react-icons/fi';

type Board = 'Global' | 'Regional';

interface Player {
  id: string;
  name: string;
  score: string;
  winRate: string;
}

const GLOBAL: Player[] = [
  { id: 'g1', name: 'NovaBlaze', score: '12,450', winRate: '78%' },
  { id: 'g2', name: 'ShadowFang', score: '11,980', winRate: '74%' },
  { id: 'g3', name: 'PixelPulse', score: '11,120', winRate: '71%' },
  { id: 'g4', name: 'VoidWalker', score: '10,760', winRate: '69%' },
  { id: 'g5', name: 'IronStrike', score: '10,310', winRate: '66%' },
];

const REGIONAL: Player[] = [
  { id: 'r1', name: 'MapleRush', score: '9,850', winRate: '72%' },
  { id: 'r2', name: 'AlpineAce', score: '9,410', winRate: '70%' },
  { id: 'r3', name: 'DeltaFox', score: '9,020', winRate: '68%' },
  { id: 'r4', name: 'StormBay', score: '8,760', winRate: '65%' },
];

const BOARDS: Board[] = ['Global', 'Regional'];

export const LeaderboardsTemplate: FC = () => {
  const [board, setBoard] = useState<Board>('Global');
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  const players = board === 'Global' ? GLOBAL : REGIONAL;

  const toggleFollow = (id: string) => {
    setFollowing((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Leaderboards</h1>
        <p className="text-base-content/50 mt-1 text-sm">Top players.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {BOARDS.map((item) => (
              <button
                key={item}
                onClick={() => setBoard(item)}
                className={`tab ${board === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">
            {players.length} players
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
                <span className="text-base-content/50 w-8 text-center text-sm font-medium">
                  {index + 1}
                </span>
                <FiAward className="text-base-content/30 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{player.name}</p>
                  <p className="text-base-content/50 flex items-center gap-1 text-xs">
                    <FiTrendingUp />
                    {player.winRate} win rate
                  </p>
                </div>
                <span className="text-sm font-semibold">{player.score}</span>
                {following[player.id] && (
                  <span className="badge badge-success badge-sm">
                    Following
                  </span>
                )}
                <button
                  onClick={() => toggleFollow(player.id)}
                  className={`btn btn-sm ${
                    following[player.id] ? 'btn-ghost' : 'btn-outline'
                  }`}>
                  {following[player.id] ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

LeaderboardsTemplate.displayName = 'LeaderboardsTemplate';
