'use client';

import type { FC } from 'react';
import { useState } from 'react';

type Segment = 'New' | 'Returning' | 'VIP';
type SegmentFilter = 'All' | Segment;

interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: string;
  segment: Segment;
}

const CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Alice Chen',
    email: 'alice@acme.com',
    orders: 8,
    spent: '$1,240.00',
    segment: 'VIP',
  },
  {
    id: 'c2',
    name: 'Bob Martinez',
    email: 'bob@acme.com',
    orders: 3,
    spent: '$320.50',
    segment: 'Returning',
  },
  {
    id: 'c3',
    name: 'Carol Smith',
    email: 'carol@acme.com',
    orders: 1,
    spent: '$89.00',
    segment: 'New',
  },
  {
    id: 'c4',
    name: 'David Lee',
    email: 'david@acme.com',
    orders: 5,
    spent: '$640.75',
    segment: 'VIP',
  },
  {
    id: 'c5',
    name: 'Emma Wilson',
    email: 'emma@acme.com',
    orders: 2,
    spent: '$150.00',
    segment: 'Returning',
  },
  {
    id: 'c6',
    name: 'Frank Moore',
    email: 'frank@acme.com',
    orders: 0,
    spent: '$0.00',
    segment: 'New',
  },
  {
    id: 'c7',
    name: 'Grace Kim',
    email: 'grace@acme.com',
    orders: 4,
    spent: '$410.20',
    segment: 'Returning',
  },
];

const FILTERS: SegmentFilter[] = ['All', 'New', 'Returning', 'VIP'];

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

const getSegmentBadge = (segment: Segment) => {
  switch (segment) {
    case 'New':
      return <span className="badge badge-info badge-sm">New</span>;
    case 'VIP':
      return <span className="badge badge-warning badge-sm">VIP</span>;
    default:
      return <span className="badge badge-ghost badge-sm">Returning</span>;
  }
};

export const CustomersTemplate: FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<SegmentFilter>('All');

  const query = search.trim().toLowerCase();

  const filtered = CUSTOMERS.filter((customer) => {
    const matchesSegment = filter === 'All' || customer.segment === filter;
    const matchesQuery =
      query === '' ||
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query);
    return matchesSegment && matchesQuery;
  });

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Segment and manage your customer base.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              aria-label="Search customers"
              className="input input-bordered input-sm flex-1 sm:max-w-xs"
            />
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
          </div>
          <p className="text-base-content/50 text-sm">
            {filtered.length} customers
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {filtered.length === 0 ? (
              <p className="text-base-content/50 px-4 py-6 text-sm">
                No customers found
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Orders
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Spent
                      </th>
                      <th className="px-4 py-3 font-medium">Segment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((customer) => (
                      <tr
                        key={customer.id}
                        className="border-base-content/10 border-b">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-base-300 flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium">
                              {getInitials(customer.name)}
                            </div>
                            <span className="text-sm font-medium">
                              {customer.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{customer.email}</td>
                        <td className="px-4 py-3 text-right text-sm">
                          {customer.orders}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {customer.spent}
                        </td>
                        <td className="px-4 py-3">
                          {getSegmentBadge(customer.segment)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

CustomersTemplate.displayName = 'CustomersTemplate';
