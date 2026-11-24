import type { FC } from 'react';

interface SavingsGoal {
  name: string;
  current: number;
  target: number;
  targetDate?: string;
}

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  currency?: string;
  title?: string;
}

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const SavingsGoals: FC<SavingsGoalsProps> = ({
  goals,
  currency = 'USD',
  title = 'Savings goals',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-4">
      <h3 className="card-title">{title}</h3>
      {goals.map((goal) => {
        const percentage =
          goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
        return (
          <div key={goal.name} className="bg-base-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{goal.name}</span>
              <span className="badge badge-primary badge-sm">
                {percentage}%
              </span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={Math.min(goal.current, goal.target)}
              max={goal.target}
            />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-base-content/60">
                {formatAmount(goal.current, currency)}
              </span>
              {goal.targetDate && (
                <span className="text-base-content/40">
                  by {goal.targetDate}
                </span>
              )}
            </div>
          </div>
        );
      })}
      {goals.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No savings goals yet.
        </p>
      )}
    </div>
  </section>
);
