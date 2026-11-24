import type { FC } from 'react';

interface Order {
  id: string;
  number?: string;
  date?: string;
  total: number;
  status?: 'shipped' | 'processing' | 'delivered' | 'cancelled';
  summary?: string;
}

interface OrderHistoryProps {
  orders: Order[];
  title?: string;
}

const statusClass: Record<string, string> = {
  shipped: 'badge-info',
  processing: 'badge-warning',
  delivered: 'badge-success',
  cancelled: 'badge-error',
};

const formatTotal = (total: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(total);

export const OrderHistory: FC<OrderHistoryProps> = ({
  orders,
  title = 'Order history',
}) => (
  <section className="py-4">
    <h2 className="mb-3 text-xl">{title}</h2>
    <ul className="flex flex-col gap-3">
      {orders.length === 0 && (
        <li className="text-base-content/50 text-sm">No orders yet.</li>
      )}
      {orders.map((order) => (
        <li
          key={order.id}
          className="card bg-base-200 border-base-content/10 rounded-xl border">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">
                  {order.number ?? order.id}
                </h3>
                {order.summary && (
                  <p className="text-base-content/50 text-sm">
                    {order.summary}
                  </p>
                )}
              </div>
              <p className="text-base font-medium">
                {formatTotal(order.total)}
              </p>
            </div>
            <div className="text-base-content/40 flex items-center gap-3 text-xs">
              {order.date && <time>{order.date}</time>}
              {order.status && (
                <span
                  className={`badge badge-sm ${
                    statusClass[order.status] ?? 'badge-ghost'
                  }`}>
                  {order.status}
                </span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  </section>
);
