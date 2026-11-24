import type { FC } from 'react';

interface LoyaltyCardProps {
  tier: string;
  points: number;
  pointsToNext?: number;
  nextTier?: string;
  program?: string;
}

export const LoyaltyCard: FC<LoyaltyCardProps> = ({
  tier,
  points,
  pointsToNext,
  nextTier,
  program = 'Loyalty program',
}) => {
  let progress = 100;
  if (pointsToNext !== undefined && pointsToNext > 0) {
    progress = Math.min(100, Math.round((points / pointsToNext) * 100));
  }

  return (
    <div
      className="card from-primary to-secondary text-primary-content w-full bg-gradient-to-r shadow"
      data-testid="loyalty-card">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm tracking-widest uppercase">{program}</span>
          <span className="badge badge-ghost" data-testid="loyalty-tier">
            {tier}
          </span>
        </div>
        <p className="text-3xl font-bold" data-testid="loyalty-points">
          {points.toLocaleString()}
        </p>
        <p className="text-primary-content/80 text-sm">points</p>
        {nextTier && pointsToNext !== undefined && (
          <div className="flex flex-col gap-1">
            <progress
              className="progress progress-ghost w-full"
              value={progress}
              max={100}
              data-testid="loyalty-progress"
            />
            <span className="text-primary-content/80 text-xs">
              {pointsToNext - points} points to {nextTier}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
