import type { FC } from 'react';

interface FlightCardProps {
  airline: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  duration?: string;
  stops?: number;
  flightNo?: string;
  currency?: string;
}

export const FlightCard: FC<FlightCardProps> = ({
  airline,
  from,
  to,
  departureTime,
  arrivalTime,
  price,
  duration,
  stops = 0,
  flightNo,
  currency = '$',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="flight-card">
    <div className="card-body gap-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">{airline}</span>
        {flightNo && (
          <span className="text-base-content/60 font-mono text-xs">
            {flightNo}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-left">
          <p className="text-lg font-semibold">{departureTime}</p>
          <p className="text-base-content/60 text-sm">{from}</p>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-base-content/50 text-xs">
            {stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`}
          </span>
          <span className="border-base-content/40 w-16 border-t border-dashed" />
          {duration && (
            <span className="text-base-content/50 text-xs">{duration}</span>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">{arrivalTime}</p>
          <p className="text-base-content/60 text-sm">{to}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-base-content/70 text-sm">
          {from} → {to}
        </span>
        <span className="text-xl font-bold" data-testid="flight-price">
          {currency}
          {price.toFixed(2)}
        </span>
      </div>
    </div>
  </div>
);
