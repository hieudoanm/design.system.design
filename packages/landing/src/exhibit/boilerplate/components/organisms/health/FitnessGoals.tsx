import type { FC } from 'react';

interface FitnessGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  deadline?: string;
}

interface FitnessGoalsProps {
  goals: FitnessGoal[];
  title?: string;
}

export const FitnessGoals: FC<FitnessGoalsProps> = ({
  goals,
  title = 'Fitness goals',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-4">
      <h3 className="card-title">{title}</h3>
      {goals.map((goal) => {
        const percentage =
          goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
        return (
          <div key={goal.id} className="bg-base-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{goal.name}</span>
              <span className="badge badge-primary badge-sm">
                {percentage}%
              </span>
            </div>
            <progress
              className="progress progress-success w-full"
              value={Math.min(goal.current, goal.target)}
              max={goal.target}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-base-content/60">
                {goal.current} / {goal.target} {goal.unit}
              </span>
              {goal.deadline && (
                <span className="text-base-content/40">by {goal.deadline}</span>
              )}
            </div>
          </div>
        );
      })}
      {goals.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No fitness goals set.
        </p>
      )}
    </div>
  </section>
);
