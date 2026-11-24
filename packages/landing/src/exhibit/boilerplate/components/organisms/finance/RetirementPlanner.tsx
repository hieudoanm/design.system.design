import type { FC } from 'react';

interface RetirementPlannerProps {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn?: number;
  currency?: string;
  title?: string;
}

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const RetirementPlanner: FC<RetirementPlannerProps> = ({
  currentAge,
  retirementAge,
  currentSavings,
  monthlyContribution,
  expectedReturn = 7,
  currency = 'USD',
  title = 'Retirement planner',
}) => {
  const years = Math.max(retirementAge - currentAge, 0);
  const rate = expectedReturn / 100;
  const growthFactor = Math.pow(1 + rate, years);
  const projected = Math.round(
    currentSavings * growthFactor +
      monthlyContribution * 12 * ((growthFactor - 1) / (rate || 1))
  );

  return (
    <section className="card bg-base-200 w-full">
      <div className="card-body flex flex-col gap-4">
        <h3 className="card-title">{title}</h3>
        <dl className="grid grid-cols-2 gap-3">
          <div className="bg-base-100 rounded-xl p-4">
            <dt className="text-base-content/50 text-xs">Current age</dt>
            <dd className="text-lg">{currentAge}</dd>
          </div>
          <div className="bg-base-100 rounded-xl p-4">
            <dt className="text-base-content/50 text-xs">Retirement age</dt>
            <dd className="text-lg">{retirementAge}</dd>
          </div>
          <div className="bg-base-100 rounded-xl p-4">
            <dt className="text-base-content/50 text-xs">
              Monthly contribution
            </dt>
            <dd className="text-lg">
              {formatAmount(monthlyContribution, currency)}
            </dd>
          </div>
          <div className="bg-base-100 rounded-xl p-4">
            <dt className="text-base-content/50 text-xs">
              Projected at retirement
            </dt>
            <dd className="text-success text-lg" data-testid="projected">
              {formatAmount(projected, currency)}
            </dd>
          </div>
        </dl>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-sm">
            <span>Years to retirement</span>
            <span className="font-medium" data-testid="years">
              {years} yrs
            </span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={currentAge}
            max={retirementAge}
          />
        </div>
      </div>
    </section>
  );
};
