'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiRefreshCw, FiX } from 'react-icons/fi';

type SubscriptionStatus = 'Active' | 'Past due' | 'Cancelled';

interface Subscription {
  id: string;
  plan: string;
  customer: string;
  amount: number;
  renews: string;
  status: SubscriptionStatus;
}

const SUBSCRIPTIONS: Subscription[] = [
  {
    id: 's1',
    plan: 'Pro',
    customer: 'Acme Corp',
    amount: 99,
    renews: 'Sep 02',
    status: 'Active',
  },
  {
    id: 's2',
    plan: 'Team',
    customer: 'Globex Inc',
    amount: 149,
    renews: 'Aug 20',
    status: 'Past due',
  },
  {
    id: 's3',
    plan: 'Basic',
    customer: 'Initech',
    amount: 29,
    renews: 'Aug 12',
    status: 'Active',
  },
  {
    id: 's4',
    plan: 'Enterprise',
    customer: 'Umbrella LLC',
    amount: 499,
    renews: 'Sep 15',
    status: 'Active',
  },
  {
    id: 's5',
    plan: 'Pro',
    customer: 'Stark Industries',
    amount: 99,
    renews: 'Aug 28',
    status: 'Cancelled',
  },
  {
    id: 's6',
    plan: 'Basic',
    customer: 'Wayne Enterprises',
    amount: 29,
    renews: 'Jul 30',
    status: 'Past due',
  },
];

const getStatusBadge = (status: SubscriptionStatus) => {
  switch (status) {
    case 'Past due':
      return <span className="badge badge-warning badge-sm">Past due</span>;
    case 'Cancelled':
      return <span className="badge badge-neutral badge-sm">Cancelled</span>;
    default:
      return <span className="badge badge-success badge-sm">Active</span>;
  }
};

export const SubscriptionsTemplate: FC = () => {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(SUBSCRIPTIONS);

  const activeCount = subscriptions.filter(
    (subscription) => subscription.status === 'Active'
  ).length;

  const setStatus = (id: string, status: SubscriptionStatus) => {
    setSubscriptions((prev) =>
      prev.map((subscription) =>
        subscription.id === id ? { ...subscription, status } : subscription
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Manage recurring subscriptions and renewals.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {activeCount} active subscriptions
        </p>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Renews</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr
                      key={subscription.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {subscription.plan}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {subscription.customer}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        ${subscription.amount}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {subscription.renews}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(subscription.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {subscription.status === 'Active' && (
                          <button
                            onClick={() =>
                              setStatus(subscription.id, 'Cancelled')
                            }
                            className="btn btn-ghost btn-xs gap-1">
                            <FiX />
                            Cancel
                          </button>
                        )}
                        {subscription.status === 'Past due' && (
                          <button
                            onClick={() => setStatus(subscription.id, 'Active')}
                            className="btn btn-ghost btn-xs gap-1">
                            <FiRefreshCw />
                            Send reminder
                          </button>
                        )}
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

SubscriptionsTemplate.displayName = 'SubscriptionsTemplate';
