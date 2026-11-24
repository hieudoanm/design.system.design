import type { FC, ReactNode } from 'react';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  avatar?: ReactNode;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  limit?: number;
  className?: string;
}

const medals = ['🥇', '🥈', '🥉'];

export const Leaderboard: FC<LeaderboardProps> = ({
  entries,
  title,
  limit,
  className = '',
}) => {
  const ranked = [...entries].sort((a, b) => b.score - a.score);
  const shown = limit === undefined ? ranked : ranked.slice(0, limit);

  return (
    <section className={`flex w-full flex-col gap-3 ${className}`}>
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      <ol className="flex flex-col gap-2">
        {shown.map((entry, index) => {
          const rank = index + 1;

          return (
            <li
              key={entry.id}
              className={`bg-base-200 border-base-content/10 flex items-center gap-3 rounded-xl border p-3 ${
                rank === 1 ? 'ring-primary/40 ring-2' : ''
              }`}>
              <span className="w-8 text-center text-sm font-semibold">
                {medals[index] ?? `#${rank}`}
              </span>
              {entry.avatar}
              <span className="flex-1 text-sm font-medium">{entry.name}</span>
              <span className="badge badge-outline">{entry.score}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

Leaderboard.displayName = 'Leaderboard';
