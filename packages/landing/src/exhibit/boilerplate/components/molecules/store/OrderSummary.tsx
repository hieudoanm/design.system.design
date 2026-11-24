import type { FC } from 'react';

interface OrderSummaryProps {
  orderNumber: string;
  status: string;
  placedAt?: string;
  paymentMethod?: string;
  itemCount?: number;
  total: number;
  currency?: string;
}

const statusClass: Record<string, string> = {
  delivered: 'badge-success',
  shipped: 'badge-info',
  processing: 'badge-warning',
  cancelled: 'badge-error',
};

export const OrderSummary: FC<OrderSummaryProps> = ({
  orderNumber,
  status,
  placedAt,
  paymentMethod,
  itemCount,
  total,
  currency = '$',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="order-summary">
    <div className="card-body gap-3">
      <div className="flex items-center justify-between">
        <h3 className="card-title text-base">{orderNumber}</h3>
        <span
          className={`badge ${statusClass[status] ?? 'badge-neutral'}`}
          data-testid="order-status">
          {status}
        </span>
      </div>
      <dl className="flex flex-col gap-1 text-sm">
        {placedAt && (
          <div className="flex justify-between">
            <dt className="text-base-content/60">Placed</dt>
            <dd>{placedAt}</dd>
          </div>
        )}
        {paymentMethod && (
          <div className="flex justify-between">
            <dt className="text-base-content/60">Payment</dt>
            <dd>{paymentMethod}</dd>
          </div>
        )}
        {itemCount !== undefined && (
          <div className="flex justify-between">
            <dt className="text-base-content/60">Items</dt>
            <dd>{itemCount}</dd>
          </div>
        )}
        <div className="flex justify-between text-base font-semibold">
          <dt>Total</dt>
          <dd data-testid="order-total">
            {currency}
            {total.toFixed(2)}
          </dd>
        </div>
      </dl>
    </div>
  </div>
);
