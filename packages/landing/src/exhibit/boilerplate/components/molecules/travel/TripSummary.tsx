import type { FC } from 'react';

interface TripSummaryProps {
  destination: string;
  duration: string;
  travelers?: number;
  budget?: number;
  startDate?: string;
  currency?: string;
}

export const TripSummary: FC<TripSummaryProps> = ({
  destination,
  duration,
  travelers = 1,
  budget,
  startDate,
  currency = '$',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="trip-summary">
    <div className="card-body gap-3">
      <h3 className="card-title text-base">{destination}</h3>
      <dl className="flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-base-content/60">Duration</dt>
          <dd>{duration}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-base-content/60">Travelers</dt>
          <dd>{travelers}</dd>
        </div>
        {startDate && (
          <div className="flex justify-between">
            <dt className="text-base-content/60">Start date</dt>
            <dd>{startDate}</dd>
          </div>
        )}
        {budget !== undefined && (
          <div className="flex justify-between font-semibold">
            <dt>Budget</dt>
            <dd data-testid="trip-budget">
              {currency}
              {budget.toFixed(2)}
            </dd>
          </div>
        )}
      </dl>
    </div>
  </div>
);
