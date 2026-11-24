import type { FC } from 'react';

interface OrderCardProps {
  id: string;
  customer: string;
  date: string;
  total: number;
  itemsCount: number;
  status: string;
  currency?: string;
}

export const OrderCard: FC<OrderCardProps> = ({
  id,
  customer,
  date,
  total,
  itemsCount,
  status,
  currency = '$',
}) => (
  <article data-testid="order-card" className="card bg-base-100 shadow-sm">
    <div className="card-body">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="card-title">Order #{id}</h3>
          <p className="text-base-content/60 text-sm">{customer}</p>
        </div>
        <div className="badge badge-outline badge-sm">{status}</div>
      </div>
      <p className="text-base-content/50 text-sm">
        {date} · {itemsCount} items
      </p>
      <p className="mt-1 text-xl font-bold">
        {currency}
        {total.toLocaleString()}
      </p>
    </div>
  </article>
);

OrderCard.displayName = 'OrderCard';
