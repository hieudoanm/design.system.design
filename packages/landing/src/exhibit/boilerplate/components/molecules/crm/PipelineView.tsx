import type { FC } from 'react';

interface PipelineDeal {
  id: string;
  name: string;
  amount: number;
}

interface PipelineStage {
  name: string;
  deals: PipelineDeal[];
}

interface PipelineViewProps {
  stages: PipelineStage[];
}

export const PipelineView: FC<PipelineViewProps> = ({ stages }) => (
  <section
    data-testid="pipeline-view"
    className="flex gap-4 overflow-x-auto pb-2">
    {stages.map((stage) => (
      <div
        key={stage.name}
        className="bg-base-200 flex min-w-64 flex-col gap-2 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{stage.name}</h3>
          <span className="badge badge-ghost badge-sm">
            {stage.deals.length}
          </span>
        </div>
        {stage.deals.length === 0 ? (
          <p className="text-base-content/40 p-2 text-center text-xs">
            No deals
          </p>
        ) : (
          stage.deals.map((deal) => (
            <div key={deal.id} className="card bg-base-100 shadow-sm">
              <div className="card-body p-3">
                <p className="text-sm font-medium">{deal.name}</p>
                <p className="text-base-content/60 text-xs">
                  ${deal.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    ))}
  </section>
);

PipelineView.displayName = 'PipelineView';
