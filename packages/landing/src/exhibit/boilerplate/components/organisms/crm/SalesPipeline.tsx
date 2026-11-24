import type { FC } from 'react';

interface Deal {
  id: string;
  name: string;
  value: number;
  owner?: string;
}

interface PipelineStage {
  id: string;
  name: string;
  deals: Deal[];
}

interface SalesPipelineProps {
  stages: PipelineStage[];
  title?: string;
}

const formatValue = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const SalesPipeline: FC<SalesPipelineProps> = ({
  stages,
  title = 'Sales pipeline',
}) => (
  <section className="py-4">
    <h2 className="mb-4 text-xl">{title}</h2>
    <div className="flex w-full gap-4 overflow-x-auto pb-2">
      {stages.map((stage) => (
        <div
          key={stage.id}
          className="bg-base-200 flex w-64 shrink-0 flex-col gap-2 rounded-xl p-3">
          <header className="flex items-center justify-between px-1">
            <h3 className="text-sm font-medium">{stage.name}</h3>
            <span className="badge badge-ghost badge-sm">
              {stage.deals.length}
            </span>
          </header>
          {stage.deals.length === 0 && (
            <p className="text-base-content/40 text-center text-sm">Empty</p>
          )}
          {stage.deals.map((deal) => (
            <article
              key={deal.id}
              className="bg-base-100 border-base-content/10 flex flex-col gap-1 rounded-xl border p-3 shadow-sm">
              <h4 className="text-sm font-medium">{deal.name}</h4>
              <p className="text-primary text-sm font-medium">
                {formatValue(deal.value)}
              </p>
              {deal.owner && (
                <p className="text-base-content/40 text-xs">{deal.owner}</p>
              )}
            </article>
          ))}
        </div>
      ))}
    </div>
  </section>
);
