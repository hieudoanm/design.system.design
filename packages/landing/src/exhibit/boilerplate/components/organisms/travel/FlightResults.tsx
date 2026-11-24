import type { FC } from 'react';

interface Flight {
  airline: string;
  from: string;
  to: string;
  price: number;
  duration: string;
  departure: string;
  arrival: string;
  stops: number;
}

interface FlightResultsProps {
  flights: Flight[];
  onSelect?: (index: number) => void;
}

export const FlightResults: FC<FlightResultsProps> = ({
  flights,
  onSelect,
}) => {
  if (flights.length === 0) {
    return (
      <section data-testid="flight-results" className="card bg-base-200">
        <div className="card-body items-center text-center">
          <p className="text-base-content/60">No flights found</p>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="flight-results" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Flight results</h2>
        <span className="badge badge-ghost">{flights.length} flights</span>
      </div>
      <div className="flex flex-col gap-3">
        {flights.map((flight, index) => (
          <article
            key={`${flight.airline}-${flight.departure}`}
            className="card bg-base-200">
            <div className="card-body gap-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <div className="avatar placeholder">
                    <div className="bg-primary text-primary-content w-10 rounded-lg">
                      <span className="text-xs">
                        {flight.airline.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{flight.airline}</h3>
                    <p className="text-base-content/50 text-xs">
                      {flight.departure} - {flight.arrival} &middot;{' '}
                      {flight.duration}
                    </p>
                  </div>
                </div>
                <span className="badge badge-outline">
                  {flight.from} &rarr; {flight.to}
                </span>
              </div>
              <div className="border-base-content/10 flex items-center justify-between border-t pt-3">
                <p className="text-base-content/50 text-xs">
                  {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop(s)`}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">
                    ${flight.price.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onSelect?.(index)}>
                    Select
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
