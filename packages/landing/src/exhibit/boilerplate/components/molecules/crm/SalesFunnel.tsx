import type { FC } from 'react';

interface FunnelStage {
  label: string;
  count: number;
}

interface SalesFunnelProps {
  stages: FunnelStage[];
}

export const SalesFunnel: FC<SalesFunnelProps> = ({ stages }) => {
  const max = Math.max(...stages.map((stage) => stage.count), 1);

  return (
    <section data-testid="sales-funnel" className="flex flex-col gap-2">
      <h3 className="text-lg font-medium">Sales funnel</h3>
      {stages.map((stage) => (
        <div key={stage.label} className="flex items-center gap-3">
          <span className="w-28 text-sm">{stage.label}</span>
          <div className="flex-1">
            <div
              className="bg-primary text-primary-content flex items-center justify-end rounded-md px-2 py-2 text-xs"
              style={{ width: `${(stage.count / max) * 100}%` }}>
              {stage.count}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

SalesFunnel.displayName = 'SalesFunnel';
