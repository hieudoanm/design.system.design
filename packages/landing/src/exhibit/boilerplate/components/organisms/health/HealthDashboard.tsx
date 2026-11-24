import type { FC } from 'react';

interface Vital {
  label: string;
  value: number;
  unit: string;
}

interface HealthDashboardProps {
  name?: string;
  vitals: Vital[];
  steps?: number;
  stepsGoal?: number;
  calories?: number;
  sleepHours?: number;
}

export const HealthDashboard: FC<HealthDashboardProps> = ({
  name = 'there',
  vitals,
  steps = 0,
  stepsGoal = 10000,
  calories = 0,
  sleepHours = 0,
}) => {
  const stepsPercentage =
    stepsGoal > 0 ? Math.round((steps / stepsGoal) * 100) : 0;

  return (
    <section className="flex w-full flex-col gap-4" data-testid="dashboard">
      <div>
        <h2 className="text-2xl font-light">Good day, {name}.</h2>
        <p className="text-base-content/60 text-sm">
          Here is your health overview.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {vitals.map((vital) => (
          <div key={vital.label} className="card bg-base-200">
            <div className="card-body p-4">
              <p className="text-base-content/50 text-xs">{vital.label}</p>
              <p className="text-2xl font-light">
                {vital.value}{' '}
                <span className="text-base-content/50 text-xs">
                  {vital.unit}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="card bg-base-200 lg:col-span-2">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title">Activity</h3>
              <span className="text-base-content/60 text-sm">
                {steps.toLocaleString()} steps
              </span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={Math.min(steps, stepsGoal)}
              max={stepsGoal}
            />
            <p
              className="text-base-content/50 text-xs"
              data-testid="steps-percent">
              {stepsPercentage}% of your daily {stepsGoal.toLocaleString()} step
              goal
            </p>
          </div>
        </div>
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Today</h3>
            <p className="text-2xl font-light">
              {calories}{' '}
              <span className="text-base-content/50 text-xs">kcal</span>
            </p>
            <p className="text-base-content/50 text-xs">
              {sleepHours} hours of sleep
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
