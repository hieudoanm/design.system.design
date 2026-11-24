import type { FC } from 'react';

interface Deal {
  id: string;
  title: string;
  price: number;
  oldPrice: number;
  endsIn?: string;
}

interface DealsSectionProps {
  deals: Deal[];
}

export const DealsSection: FC<DealsSectionProps> = ({ deals }) => {
  return (
    <section data-testid="deals-section" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Today&apos;s deals</h2>
        <span className="badge badge-error">Limited time</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {deals.map((deal) => {
          const discount = Math.round((1 - deal.price / deal.oldPrice) * 100);
          return (
            <article key={deal.id} className="card bg-base-200">
              <figure className="bg-primary/10 relative flex aspect-square items-center justify-center">
                <span
                  className="text-base-content/30 text-3xl"
                  aria-hidden="true">
                  &#9644;
                </span>
                <span className="badge badge-error absolute top-2 left-2">
                  -{discount}%
                </span>
              </figure>
              <div className="card-body gap-1 p-3">
                <h3 className="line-clamp-1 text-sm font-medium">
                  {deal.title}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold">
                    ${deal.price.toFixed(2)}
                  </span>
                  <span className="text-base-content/40 text-xs line-through">
                    ${deal.oldPrice.toFixed(2)}
                  </span>
                </div>
                {deal.endsIn && (
                  <p className="text-base-content/50 text-xs">
                    Ends in {deal.endsIn}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
