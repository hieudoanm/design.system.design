'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

type RefundStatus = 'Requested' | 'Approved' | 'Rejected';

interface Refund {
  id: string;
  order: string;
  customer: string;
  amount: string;
  reason: string;
  status: RefundStatus;
}

const REFUNDS: Refund[] = [
  {
    id: 'RF-1001',
    order: '#2001',
    customer: 'Alice Chen',
    amount: '$249.00',
    reason: 'Damaged item',
    status: 'Requested',
  },
  {
    id: 'RF-1002',
    order: '#2002',
    customer: 'Bob Martinez',
    amount: '$59.00',
    reason: 'Wrong size',
    status: 'Requested',
  },
  {
    id: 'RF-1003',
    order: '#2003',
    customer: 'Carol Smith',
    amount: '$129.00',
    reason: 'Duplicate charge',
    status: 'Approved',
  },
  {
    id: 'RF-1004',
    order: '#2004',
    customer: 'David Lee',
    amount: '$79.00',
    reason: 'Changed mind',
    status: 'Rejected',
  },
  {
    id: 'RF-1005',
    order: '#2005',
    customer: 'Emma Wilson',
    amount: '$188.00',
    reason: 'Late delivery',
    status: 'Requested',
  },
  {
    id: 'RF-1006',
    order: '#2006',
    customer: 'Frank Moore',
    amount: '$99.00',
    reason: 'Defective unit',
    status: 'Approved',
  },
];

const getStatusBadge = (status: RefundStatus) => {
  switch (status) {
    case 'Approved':
      return <span className="badge badge-success badge-sm">Approved</span>;
    case 'Rejected':
      return <span className="badge badge-error badge-sm">Rejected</span>;
    default:
      return <span className="badge badge-warning badge-sm">Requested</span>;
  }
};

export const RefundsTemplate: FC = () => {
  const [refunds, setRefunds] = useState<Refund[]>(REFUNDS);

  const pendingCount = refunds.filter(
    (refund) => refund.status === 'Requested'
  ).length;

  const setStatus = (id: string, status: RefundStatus) => {
    setRefunds((prev) =>
      prev.map((refund) => (refund.id === id ? { ...refund, status } : refund))
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Refunds</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Process refund requests.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-base-content/50 text-sm">
            {pendingCount} refunds pending
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Refund</th>
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Reason</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((refund) => (
                    <tr
                      key={refund.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {refund.id}
                      </td>
                      <td className="px-4 py-3 text-sm">{refund.order}</td>
                      <td className="px-4 py-3 text-sm">{refund.customer}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        {refund.amount}
                      </td>
                      <td className="px-4 py-3 text-sm">{refund.reason}</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(refund.status)}
                      </td>
                      <td className="px-4 py-3">
                        {refund.status === 'Requested' && (
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setStatus(refund.id, 'Approved')}
                              className="btn btn-ghost btn-xs gap-1">
                              <FiCheck />
                              Approve
                            </button>
                            <button
                              onClick={() => setStatus(refund.id, 'Rejected')}
                              className="btn btn-ghost btn-xs hover:text-error gap-1">
                              <FiX />
                              Reject
                            </button>
                          </div>
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

RefundsTemplate.displayName = 'RefundsTemplate';
