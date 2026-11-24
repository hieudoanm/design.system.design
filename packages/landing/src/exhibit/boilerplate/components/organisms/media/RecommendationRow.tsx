import type { FC } from 'react';

interface Recommendation {
  id: string;
  title: string;
  subtitle: string;
  match: number;
}

interface RecommendationRowProps {
  items: Recommendation[];
  title?: string;
  onSelect?: (id: string) => void;
}

export const RecommendationRow: FC<RecommendationRowProps> = ({
  items,
  title = 'Recommended for you',
  onSelect,
}) => {
  return (
    <section data-testid="recommendation-row" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        <button type="button" className="btn btn-ghost btn-sm">
          See more
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((item) => (
          <button
            type="button"
            key={item.id}
            className="card bg-base-200 w-40 shrink-0 text-left"
            onClick={() => onSelect?.(item.id)}>
            <div className="card-body gap-1 p-3">
              <div className="flex items-center justify-between">
                <span
                  className="badge badge-accent badge-xs"
                  data-testid={`match-${item.id}`}>
                  {item.match}% match
                </span>
              </div>
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="text-base-content/50 text-xs">{item.subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
