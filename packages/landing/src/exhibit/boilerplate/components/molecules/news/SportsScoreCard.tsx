import type { FC } from 'react';

interface TeamScore {
  name: string;
  score: number;
}

interface SportsScoreCardProps {
  sport: string;
  home: TeamScore;
  away: TeamScore;
  status?: string;
  period?: string;
}

const leaderName = (home: TeamScore, away: TeamScore): string | null => {
  if (home.score > away.score) return home.name;
  if (away.score > home.score) return away.name;
  return null;
};

export const SportsScoreCard: FC<SportsScoreCardProps> = ({
  sport,
  home,
  away,
  status,
  period,
}) => {
  const leader = leaderName(home, away);

  return (
    <div
      className="card card-bordered border-base-300 bg-base-200"
      data-testid="sports-score-card">
      <div className="card-body gap-3">
        <header className="flex items-center justify-between">
          <span className="badge badge-neutral badge-sm">{sport}</span>
          {period && (
            <span className="text-base-content/50 text-xs">{period}</span>
          )}
        </header>
        <table className="table-zebra table-xs table">
          <thead>
            <tr>
              <th>Team</th>
              <th className="text-right">Score</th>
              <th className="text-right">{leader ? 'Leader' : 'Tied'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={leader === home.name ? 'font-bold' : ''}>
                {home.name}
              </td>
              <td className="text-right font-mono">{home.score}</td>
              <td className="text-right">
                {leader === home.name && (
                  <span className="badge badge-success badge-xs">Lead</span>
                )}
              </td>
            </tr>
            <tr>
              <td className={leader === away.name ? 'font-bold' : ''}>
                {away.name}
              </td>
              <td className="text-right font-mono">{away.score}</td>
              <td className="text-right">
                {leader === away.name && (
                  <span className="badge badge-success badge-xs">Lead</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
        {status && (
          <span className="badge badge-ghost badge-xs w-fit">{status}</span>
        )}
      </div>
    </div>
  );
};
