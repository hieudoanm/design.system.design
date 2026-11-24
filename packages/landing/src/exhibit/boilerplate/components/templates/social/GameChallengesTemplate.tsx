'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheckCircle, FiRefreshCw, FiZap } from 'react-icons/fi';

interface Challenge {
  id: string;
  name: string;
  description: string;
  reward: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    name: 'Win 3 matches',
    description: 'Earn a victory in any ranked queue three times.',
    reward: '500',
  },
  {
    id: 'c2',
    name: 'Deal 50,000 damage',
    description: 'Accumulate damage across any matches today.',
    reward: '300',
  },
  {
    id: 'c3',
    name: 'Play 5 games',
    description: 'Complete five full matches in any mode.',
    reward: '250',
  },
  {
    id: 'c4',
    name: 'Capture 10 objectives',
    description: 'Secure objectives in objective-based modes.',
    reward: '400',
  },
];

export const GameChallengesTemplate: FC = () => {
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});

  const claim = (id: string) => {
    setClaimed((prev) => ({ ...prev, [id]: true }));
  };

  const remaining = CHALLENGES.filter(
    (challenge) => !claimed[challenge.id]
  ).length;

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Challenges</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Daily and weekly quests.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {remaining} challenges
        </p>
        {remaining === 0 ? (
          <p className="text-base-content/50 py-10 text-center text-sm">
            No challenges available
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CHALLENGES.map((challenge) => (
              <div
                key={challenge.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body gap-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{challenge.name}</p>
                    {claimed[challenge.id] && (
                      <span className="badge badge-success badge-sm gap-1">
                        <FiCheckCircle />
                        Claimed
                      </span>
                    )}
                  </div>
                  <p className="text-base-content/50 text-xs">
                    {challenge.description}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-base-content/50 flex items-center gap-1 text-xs">
                      <FiRefreshCw />
                      {challenge.reward} XP
                    </span>
                    <button
                      onClick={() => claim(challenge.id)}
                      disabled={claimed[challenge.id]}
                      className="btn btn-outline btn-sm gap-1">
                      <FiZap />
                      {claimed[challenge.id] ? 'Claimed' : 'Claim'}
                    </button>
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

GameChallengesTemplate.displayName = 'GameChallengesTemplate';
