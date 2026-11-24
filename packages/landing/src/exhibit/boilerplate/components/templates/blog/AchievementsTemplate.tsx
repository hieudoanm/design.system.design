'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiAward, FiTarget, FiStar } from 'react-icons/fi';

interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'a1',
    name: 'First Steps',
    description: 'Complete your first lesson.',
    earned: true,
  },
  {
    id: 'a2',
    name: 'Sharp Shooter',
    description: 'Pass a quiz with 90% or higher.',
    earned: true,
  },
  {
    id: 'a3',
    name: 'Streak Master',
    description: 'Study 7 days in a row.',
    earned: true,
  },
  {
    id: 'a4',
    name: 'Course Conqueror',
    description: 'Finish your first course.',
    earned: true,
  },
  {
    id: 'a5',
    name: 'Night Owl',
    description: 'Complete a lesson after midnight.',
    earned: false,
  },
  {
    id: 'a6',
    name: 'Team Player',
    description: 'Join a study group.',
    earned: false,
  },
  {
    id: 'a7',
    name: 'Marathon',
    description: 'Study 50 hours in a year.',
    earned: false,
  },
  {
    id: 'a8',
    name: 'Perfect Score',
    description: 'Score 100% on any quiz.',
    earned: false,
  },
];

const getStatusBadge = (earned: boolean) => {
  if (earned) {
    return <span className="badge badge-success badge-sm">Earned</span>;
  }
  return <span className="badge badge-neutral badge-sm">Locked</span>;
};

export const AchievementsTemplate: FC = () => {
  const [hiddenLocked, setHiddenLocked] = useState(false);

  const earnedCount = ACHIEVEMENTS.filter((item) => item.earned).length;

  const visible = hiddenLocked
    ? ACHIEVEMENTS.filter((item) => item.earned)
    : ACHIEVEMENTS;

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Badges you have earned.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiAward />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Collection</p>
              <p className="text-2xl font-bold tracking-tight">
                {earnedCount} of {ACHIEVEMENTS.length} achievements earned
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setHiddenLocked((prev) => !prev)}
            className="btn btn-ghost btn-sm">
            {hiddenLocked ? 'Show locked' : 'Hide locked'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((achievement) => (
            <div
              key={achievement.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    {achievement.earned ? (
                      <FiStar className="text-primary" />
                    ) : (
                      <FiTarget className="text-base-content/50" />
                    )}
                  </div>
                  {getStatusBadge(achievement.earned)}
                </div>
                <h3 className="text-sm font-semibold">{achievement.name}</h3>
                <p className="text-base-content/50 mt-1 text-xs">
                  {achievement.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

AchievementsTemplate.displayName = 'AchievementsTemplate';
