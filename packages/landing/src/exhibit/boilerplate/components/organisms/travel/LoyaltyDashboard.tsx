import type { FC } from 'react';

interface Benefit {
  id: string;
  title: string;
  description?: string;
}

interface LoyaltyDashboardProps {
  tier: string;
  points: number;
  miles: number;
  benefits: Benefit[];
}

export const LoyaltyDashboard: FC<LoyaltyDashboardProps> = ({
  tier,
  points,
  miles,
  benefits,
}) => {
  return (
    <section data-testid="loyalty-dashboard" className="flex flex-col gap-4">
      <div className="stats w-full shadow">
        <div className="stat">
          <div className="stat-title">Tier</div>
          <div className="stat-value text-lg">{tier}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Points</div>
          <div className="stat-value text-lg">{points.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Miles</div>
          <div className="stat-value text-lg">{miles.toLocaleString()}</div>
        </div>
      </div>
      <div className="card bg-base-200">
        <div className="card-body gap-3 p-4">
          <h2 className="text-lg font-medium">Your benefits</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="bg-base-100 flex items-start gap-2 rounded-lg p-3">
                <span className="badge badge-primary" aria-hidden="true">
                  &#10003;
                </span>
                <div>
                  <h3 className="text-sm font-medium">{benefit.title}</h3>
                  {benefit.description && (
                    <p className="text-base-content/50 text-xs">
                      {benefit.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
