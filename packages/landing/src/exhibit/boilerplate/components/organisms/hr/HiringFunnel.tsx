import type { FC } from 'react';

interface FunnelStage {
  id: string;
  name: string;
  count: number;
  color?: string;
}

interface HiringFunnelProps {
  stages: FunnelStage[];
}

export const HiringFunnel: FC<HiringFunnelProps> = ({ stages }) => {
  const maxCount = stages.length > 0 ? stages[0].count : 0;
  const total = stages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <div
      className="bg-base-200 border-base-content/10 flex w-full flex-col gap-3 rounded-xl border p-4"
      data-testid="hiring-funnel">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Hiring funnel</h3>
        <span className="text-base-content/50 text-sm">{total} candidates</span>
      </header>
      <div className="flex flex-col gap-3">
        {stages.map((stage) => {
          const percentage =
            maxCount > 0 ? Math.round((stage.count / maxCount) * 100) : 0;
          return (
            <div key={stage.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span>{stage.name}</span>
                <span className="text-base-content/60">{stage.count}</span>
              </div>
              <progress
                className={`progress w-full ${stage.color ?? 'progress-primary'}`}
                value={stage.count}
                max={maxCount}
                data-testid={`funnel-${stage.id}`}
              />
              <p className="text-base-content/40 text-xs">
                {percentage}% of first stage
              </p>
            </div>
          );
        })}
        {stages.length === 0 && (
          <p className="text-base-content/40 text-center text-sm">
            No funnel data
          </p>
        )}
      </div>
    </div>
  );
};

HiringFunnel.displayName = 'HiringFunnel';
