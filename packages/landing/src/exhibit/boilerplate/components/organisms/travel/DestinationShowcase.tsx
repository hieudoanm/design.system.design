import type { FC } from 'react';

interface Destination {
  id: string;
  name: string;
  country: string;
  price: number;
  rating: number;
  highlights: string[];
}

interface DestinationShowcaseProps {
  destinations: Destination[];
}

export const DestinationShowcase: FC<DestinationShowcaseProps> = ({
  destinations,
}) => {
  return (
    <section
      data-testid="destination-showcase"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {destinations.map((destination) => (
        <article key={destination.id} className="card bg-base-200">
          <figure className="bg-primary/20 relative flex aspect-[4/3] items-center justify-center">
            <span className="text-base-content/30 text-4xl" aria-hidden="true">
              &#9875;
            </span>
            <span className="badge badge-primary absolute top-2 left-2">
              {destination.rating} &#9733;
            </span>
          </figure>
          <div className="card-body gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-medium">{destination.name}</h2>
                <p className="text-base-content/50 text-sm">
                  {destination.country}
                </p>
              </div>
              <p className="text-base font-semibold">
                ${destination.price.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {destination.highlights.map((highlight) => (
                <span key={highlight} className="badge badge-ghost badge-sm">
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};
