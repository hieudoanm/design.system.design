'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck } from 'react-icons/fi';

type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';
type InvoiceFilter = 'All' | InvoiceStatus;

interface Invoice {
  id: string;
  client: string;
  amount: number;
  due: string;
  status: InvoiceStatus;
}

const INVOICES: Invoice[] = [
  {
    id: 'INV-001',
    client: 'Acme Corp',
    amount: 2400,
    due: 'Aug 15',
    status: 'Pending',
  },
  {
    id: 'INV-002',
    client: 'Globex Inc',
    amount: 1250,
    due: 'Aug 10',
    status: 'Paid',
  },
  {
    id: 'INV-003',
    client: 'Initech',
    amount: 3700,
    due: 'Jul 28',
    status: 'Overdue',
  },
  {
    id: 'INV-004',
    client: 'Umbrella LLC',
    amount: 890,
    due: 'Sep 01',
    status: 'Pending',
  },
  {
    id: 'INV-005',
    client: 'Stark Industries',
    amount: 5600,
    due: 'Aug 05',
    status: 'Paid',
  },
  {
    id: 'INV-006',
    client: 'Wayne Enterprises',
    amount: 1950,
    due: 'Aug 20',
    status: 'Paid',
  },
];

const FILTERS: InvoiceFilter[] = ['All', 'Paid', 'Pending', 'Overdue'];

const getStatusBadge = (status: InvoiceStatus) => {
  switch (status) {
    case 'Paid':
      return <span className="badge badge-success badge-sm">Paid</span>;
    case 'Overdue':
      return <span className="badge badge-error badge-sm">Overdue</span>;
    default:
      return <span className="badge badge-warning badge-sm">Pending</span>;
  }
};

export const InvoicesTemplate: FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [filter, setFilter] = useState<InvoiceFilter>('All');

  const visible = invoices.filter(
    (invoice) => filter === 'All' || invoice.status === filter
  );

  const markPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, status: 'Paid' } : invoice
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Track client invoices and payment status.
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
          <p className="text-base-content/50 text-sm">
            {visible.length} invoices
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Due</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 font-mono text-sm">
                        {invoice.id}
                      </td>
                      <td className="px-4 py-3 text-sm">{invoice.client}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">{invoice.due}</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(invoice.status === 'Pending' ||
                          invoice.status === 'Overdue') && (
                          <button
                            onClick={() => markPaid(invoice.id)}
                            className="btn btn-ghost btn-xs gap-1">
                            <FiCheck />
                            Mark paid
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

InvoicesTemplate.displayName = 'InvoicesTemplate';
