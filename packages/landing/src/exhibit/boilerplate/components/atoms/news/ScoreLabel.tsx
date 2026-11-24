import type { FC } from 'react';

interface ScoreLabelProps {
  score: number;
  outOf?: number;
  label?: string;
}

export const ScoreLabel: FC<ScoreLabelProps> = ({
  score,
  outOf = 10,
  label = 'Score',
}) => (
  <span className="badge badge-ghost gap-1" data-testid="score-label">
    {label}: {score}/{outOf}
  </span>
);
