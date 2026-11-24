import type { FC } from 'react';

interface Package {
  id: string;
  name: string;
  destination: string;
  price: number;
  duration: string;
  rating: number;
  featured?: boolean;
}

interface TravelPackagesProps {
  packages: Package[];
  onSelect?: (id: string) => void;
}

export const TravelPackages: FC<TravelPackagesProps> = ({
  packages,
  onSelect,
}) => {
  return (
    <section data-testid="travel-packages" className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Travel packages</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((trip) => (
          <article
            key={trip.id}
            className={`card ${
              trip.featured ? 'bg-primary text-primary-content' : 'bg-base-200'
            }`}>
            <div className="card-body gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-medium">{trip.name}</h3>
                  <p className="text-xs opacity-70">{trip.destination}</p>
                </div>
                {trip.featured && (
                  <span className="badge badge-ghost">Best value</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span aria-hidden="true">&#9733;</span>
                <span>{trip.rating}</span>
                <span className="opacity-70">&middot; {trip.duration}</span>
              </div>
              <div className="border-base-content/10 flex items-center justify-between border-t pt-3">
                <span className="text-lg font-semibold">
                  ${trip.price.toLocaleString()}
                </span>
                <button
                  type="button"
                  className={`btn btn-sm ${
                    trip.featured ? 'btn-ghost' : 'btn-primary'
                  }`}
                  onClick={() => onSelect?.(trip.id)}>
                  View
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
