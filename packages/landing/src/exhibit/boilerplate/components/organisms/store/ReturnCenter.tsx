import type { FC } from 'react';

interface ReturnOrder {
  id: string;
  product: string;
  orderDate: string;
  status: string;
  eligible?: boolean;
}

interface ReturnCenterProps {
  orders: ReturnOrder[];
  onStartReturn?: (id: string) => void;
}

const STATUS_CLASS: Record<string, string> = {
  Pending: 'badge-warning',
  Approved: 'badge-success',
  Refunded: 'badge-info',
  Rejected: 'badge-error',
};

export const ReturnCenter: FC<ReturnCenterProps> = ({
  orders,
  onStartReturn,
}) => {
  return (
    <section data-testid="return-center" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Returns</h2>
        <span className="badge badge-ghost">{orders.length} requests</span>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Product</th>
              <th>Ordered</th>
              <th>Status</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.product}</td>
                <td>{order.orderDate}</td>
                <td>
                  <span
                    className={`badge ${
                      STATUS_CLASS[order.status] ?? 'badge-ghost'
                    }`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  {order.eligible && (
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      onClick={() => onStartReturn?.(order.id)}>
                      Start return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
