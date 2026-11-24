'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

type OrderStatus =
  'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
type OrderFilter = 'All' | OrderStatus;

interface Order {
  id: string;
  customer: string;
  total: string;
  items: string[];
  status: OrderStatus;
}

const ORDERS: Order[] = [
  {
    id: '#1001',
    customer: 'Alice Chen',
    total: '$249.00',
    items: ['Ergonomic Chair'],
    status: 'Pending',
  },
  {
    id: '#1002',
    customer: 'Bob Martinez',
    total: '$188.00',
    items: ['Mechanical Keyboard', 'Wireless Mouse'],
    status: 'Processing',
  },
  {
    id: '#1003',
    customer: 'Carol Smith',
    total: '$249.00',
    items: ['Studio Headphones'],
    status: 'Shipped',
  },
  {
    id: '#1004',
    customer: 'David Lee',
    total: '$178.00',
    items: ['Desk Lamp', 'Monitor Stand'],
    status: 'Delivered',
  },
  {
    id: '#1005',
    customer: 'Emma Wilson',
    total: '$129.00',
    items: ['Mechanical Keyboard'],
    status: 'Pending',
  },
  {
    id: '#1006',
    customer: 'Frank Moore',
    total: '$59.00',
    items: ['Wireless Mouse'],
    status: 'Cancelled',
  },
];

const FILTERS: OrderFilter[] = [
  'All',
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case 'Processing':
      return <span className="badge badge-info badge-sm">Processing</span>;
    case 'Shipped':
      return <span className="badge badge-primary badge-sm">Shipped</span>;
    case 'Delivered':
      return <span className="badge badge-success badge-sm">Delivered</span>;
    case 'Cancelled':
      return <span className="badge badge-error badge-sm">Cancelled</span>;
    default:
      return <span className="badge badge-warning badge-sm">Pending</span>;
  }
};

export const OrdersTemplate: FC = () => {
  const [orders] = useState<Order[]>(ORDERS);
  const [filter, setFilter] = useState<OrderFilter>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visible = orders.filter(
    (order) => filter === 'All' || order.status === filter
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Review and fulfill customer orders.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`tab ${filter === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">{orders.length} orders</p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Items</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((order) => (
                    <tr
                      key={order.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 text-sm">{order.customer}</td>
                      <td className="px-4 py-3 text-sm">{order.total}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-2">
                          <button
                            onClick={() =>
                              setExpandedId(
                                expandedId === order.id ? null : order.id
                              )
                            }
                            className="btn btn-ghost btn-xs gap-1">
                            {expandedId === order.id ? (
                              <FiChevronUp />
                            ) : (
                              <FiChevronDown />
                            )}
                            {expandedId === order.id
                              ? `Hide order ${order.id}`
                              : `View order ${order.id}`}
                          </button>
                          {expandedId === order.id && (
                            <ul className="text-xs">
                              {order.items.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

OrdersTemplate.displayName = 'OrdersTemplate';
