import type { FC } from 'react';

interface TrackingUpdate {
  time: string;
  location: string;
  status: string;
  description?: string;
}

interface ShippingTrackerProps {
  carrier: string;
  trackingNumber: string;
  status: string;
  estimatedDelivery?: string;
  updates: TrackingUpdate[];
}

export const ShippingTracker: FC<ShippingTrackerProps> = ({
  carrier,
  trackingNumber,
  status,
  estimatedDelivery,
  updates,
}) => {
  return (
    <section data-testid="shipping-tracker" className="flex flex-col gap-4">
      <div className="card bg-base-200">
        <div className="card-body gap-1 p-4">
          <p className="text-base-content/50 text-xs">{carrier}</p>
          <h2 className="text-lg font-medium">{trackingNumber}</h2>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary">{status}</span>
            {estimatedDelivery && (
              <span className="text-base-content/50 text-xs">
                ETA {estimatedDelivery}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="card bg-base-200">
        <div className="card-body gap-4 p-4">
          <progress
            className="progress progress-primary w-full"
            value={updates.length}
            max={Math.max(updates.length, 4)}
          />
          <ul className="timeline timeline-vertical">
            {updates.map((update, index) => (
              <li key={`${update.status}-${update.time}`}>
                {index > 0 && <hr className="bg-primary" />}
                <div className="timeline-middle">
                  <span
                    className={`badge badge-sm rounded-full ${
                      index === 0 ? 'badge-primary' : 'badge-ghost'
                    }`}>
                    &#9679;
                  </span>
                </div>
                <div className="timeline-end mb-4">
                  <h3 className="text-sm font-medium">{update.status}</h3>
                  <p className="text-base-content/50 text-xs">
                    {update.location} &middot; {update.time}
                  </p>
                  {update.description && (
                    <p className="text-base-content/70 text-sm">
                      {update.description}
                    </p>
                  )}
                </div>
                {index > 0 && <hr />}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
