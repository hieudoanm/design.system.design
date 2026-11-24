import type { FC } from 'react';

interface TimelineEntry {
  status: string;
  label: string;
  time: string;
}

interface OrderItem {
  name: string;
  qty: number;
}

interface OrderTrackingProps {
  orderId: string;
  status: string;
  eta?: string;
  items: OrderItem[];
  timeline: TimelineEntry[];
}

export const OrderTracking: FC<OrderTrackingProps> = ({
  orderId,
  status,
  eta,
  items,
  timeline,
}) => {
  return (
    <section data-testid="order-tracking" className="flex flex-col gap-4">
      <div className="hero bg-primary text-primary-content rounded-2xl">
        <div className="hero-content py-6 text-left">
          <div>
            <h1 className="text-xl font-medium">Order #{orderId}</h1>
            <p className="opacity-80">{status}</p>
            {eta && <p className="opacity-80">Estimated delivery: {eta}</p>}
          </div>
        </div>
      </div>
      <div className="card bg-base-200">
        <div className="card-body gap-2 p-4">
          <h2 className="text-sm font-medium">Items</h2>
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.name} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span className="text-base-content/50">{item.qty} &times;</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ul className="timeline timeline-vertical">
        {timeline.map((entry, index) => {
          const last = index === timeline.length - 1;
          return (
            <li key={entry.status}>
              {index > 0 && <hr className="bg-primary" />}
              <div className="timeline-middle">
                <span
                  className={`badge badge-sm rounded-full ${
                    last ? 'badge-primary' : 'badge-ghost'
                  }`}>
                  &#9679;
                </span>
              </div>
              <div className="timeline-end mb-4">
                <h3 className="text-sm font-medium">{entry.label}</h3>
                <p className="text-base-content/50 text-xs">{entry.time}</p>
              </div>
              {!last && <hr />}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
