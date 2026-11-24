import type { FC } from 'react';

interface TeamScore {
  name: string;
  score: number;
}

interface ScoreBoardProps {
  home: TeamScore;
  away: TeamScore;
  period?: string;
  status?: string;
  showLeader?: boolean;
}

const leaderName = (home: TeamScore, away: TeamScore): string | null => {
  if (home.score > away.score) return home.name;
  if (away.score > home.score) return away.name;
  return null;
};

export const ScoreBoard: FC<ScoreBoardProps> = ({
  home,
  away,
  period,
  status,
  showLeader = true,
}) => {
  const leader = leaderName(home, away);

  const teamClass = (name: string): string => {
    if (showLeader && leader === name) return 'text-success font-bold';
    return '';
  };

  return (
    <div
      className="card card-bordered border-base-300 bg-base-200"
      data-testid="score-board">
      <div className="card-body gap-3">
        {(status || period) && (
          <div className="flex items-center justify-between text-xs">
            {status && (
              <span className="badge badge-ghost badge-xs">{status}</span>
            )}
            {period && <span className="text-base-content/50">{period}</span>}
          </div>
        )}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
          <div className="flex flex-col gap-1">
            <span className={teamClass(away.name)}>{away.name}</span>
            <span className="font-mono text-2xl font-light">{away.score}</span>
          </div>
          <span className="text-base-content/40 text-sm">vs</span>
          <div className="flex flex-col gap-1">
            <span className={teamClass(home.name)}>{home.name}</span>
            <span className="font-mono text-2xl font-light">{home.score}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
