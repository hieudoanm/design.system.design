import type { FC } from 'react';

interface Reward {
  id: string;
  name: string;
  points: number;
  claimed?: boolean;
}

interface LoyaltyProgramProps {
  points: number;
  tier: string;
  pointsToNext?: number;
  rewards: Reward[];
}

export const LoyaltyProgram: FC<LoyaltyProgramProps> = ({
  points,
  tier,
  pointsToNext,
  rewards,
}) => {
  const progress = pointsToNext
    ? Math.min(100, Math.round((points / (points + pointsToNext)) * 100))
    : 100;

  return (
    <section data-testid="loyalty-program" className="flex flex-col gap-4">
      <div className="hero bg-secondary text-secondary-content rounded-2xl">
        <div className="hero-content flex-col py-8 text-center">
          <span className="badge badge-ghost badge-lg">{tier} member</span>
          <p className="text-4xl font-semibold">{points.toLocaleString()}</p>
          <p className="text-sm opacity-80">points available</p>
        </div>
      </div>
      {pointsToNext !== undefined && (
        <div className="card bg-base-200">
          <div className="card-body gap-2 p-4">
            <div className="flex justify-between text-sm">
              <span>Progress to next tier</span>
              <span className="text-base-content/50">
                {pointsToNext} points to go
              </span>
            </div>
            <progress
              className="progress progress-secondary w-full"
              value={progress}
              max={100}
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rewards.map((reward) => (
          <article key={reward.id} className="card bg-base-200">
            <div className="card-body gap-2 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">{reward.name}</h3>
                <span className="badge badge-outline">{reward.points} pts</span>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${
                  reward.claimed ? 'btn-outline' : 'btn-secondary'
                }`}
                disabled={reward.claimed || points < reward.points}>
                {reward.claimed ? 'Claimed' : 'Redeem'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
