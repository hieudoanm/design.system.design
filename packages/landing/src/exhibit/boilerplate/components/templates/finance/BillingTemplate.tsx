'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiCheck,
  FiCreditCard,
  FiDatabase,
  FiDownload,
  FiMail,
  FiUsers,
} from 'react-icons/fi';

type PlanTier = 'free' | 'pro' | 'enterprise';
type InvoiceStatus = 'paid' | 'pending' | 'failed';

interface Plan {
  name: string;
  price: string;
  period: string;
  members: number;
}

interface UsageItem {
  label: string;
  used: number;
  total: number;
  icon: FC<{ className?: string }>;
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: InvoiceStatus;
}

const PLANS: Record<PlanTier, Plan> = {
  free: { name: 'Free', price: '$0', period: '/mo', members: 5 },
  pro: { name: 'Pro', price: '$12', period: '/mo', members: 50 },
  enterprise: { name: 'Enterprise', price: '$99', period: '/mo', members: 500 },
};

const PLAN_TIERS: PlanTier[] = ['free', 'pro', 'enterprise'];

const USAGE: UsageItem[] = [
  { label: 'Members', used: 12, total: 50, icon: FiUsers },
  { label: 'Emails', used: 2400, total: 5000, icon: FiMail },
  { label: 'Storage', used: 7, total: 25, icon: FiDatabase },
];

const INVOICES: Invoice[] = [
  { id: 'inv-1', date: 'Jul 01, 2026', amount: '$12.00', status: 'paid' },
  { id: 'inv-2', date: 'Jun 01, 2026', amount: '$12.00', status: 'pending' },
  { id: 'inv-3', date: 'May 01, 2026', amount: '$0.00', status: 'failed' },
];

const getInvoiceBadge = (status: InvoiceStatus) => {
  switch (status) {
    case 'paid':
      return <span className="badge badge-success badge-sm">Paid</span>;
    case 'pending':
      return <span className="badge badge-warning badge-sm">Pending</span>;
    default:
      return <span className="badge badge-error badge-sm">Failed</span>;
  }
};

const UsageBar: FC<UsageItem> = ({ label, used, total, icon: Icon }) => {
  const percent = Math.min(100, Math.round((used / total) * 100));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <Icon className="text-base-content/50 h-4 w-4" />
          {label}
        </span>
        <span className="text-base-content/50 text-xs">
          {used} / {total}
        </span>
      </div>
      <div className="bg-base-300 h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

UsageBar.displayName = 'UsageBar';

export const BillingTemplate: FC = () => {
  const [plan, setPlan] = useState<PlanTier>('pro');
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const [payFormOpen, setPayFormOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');

  const downloadInvoice = (id: string) => setDownloaded(id);

  const saveCard = () => setPayFormOpen(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Manage your plan, invoices and payment method.
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-semibold">Current plan</h3>
              <span className="badge badge-primary badge-sm">
                {PLANS[plan].name}
              </span>
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {PLANS[plan].price}
              <span className="text-base-content/50 text-sm font-normal">
                {PLANS[plan].period}
              </span>
            </p>
            <div className="mt-4 flex flex-col gap-4">
              {USAGE.map((usage) => (
                <UsageBar key={usage.label} {...usage} />
              ))}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <h3 className="mb-4 font-semibold">Plan tier</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PLAN_TIERS.map((tier) => (
                <button
                  key={tier}
                  onClick={() => setPlan(tier)}
                  className={`card border text-left transition-colors ${
                    plan === tier
                      ? 'bg-primary/10 border-primary'
                      : 'bg-base-100 border-base-content/10 hover:border-primary/40'
                  }`}>
                  <div className="card-body p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-semibold">{PLANS[tier].name}</span>
                      {plan === tier && (
                        <span className="badge badge-primary badge-sm">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-bold">
                      {PLANS[tier].price}
                      <span className="text-base-content/50 text-sm font-normal">
                        {PLANS[tier].period}
                      </span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="p-5 pb-2">
              <h3 className="font-semibold">Invoices</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-5 py-2 font-medium">Date</th>
                    <th className="px-5 py-2 font-medium">Amount</th>
                    <th className="px-5 py-2 font-medium">Status</th>
                    <th className="px-5 py-2 text-right font-medium">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-base-content/10 border-b">
                      <td className="px-5 py-3 text-sm">{invoice.date}</td>
                      <td className="px-5 py-3 text-sm font-medium">
                        {invoice.amount}
                      </td>
                      <td className="px-5 py-3">
                        {getInvoiceBadge(invoice.status)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => downloadInvoice(invoice.id)}
                          className="btn btn-ghost btn-xs text-base-content/60 hover:text-primary">
                          <FiDownload className="h-3.5 w-3.5" />
                          {downloaded === invoice.id
                            ? 'Downloaded'
                            : 'Download'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-lg">
                  <FiCreditCard className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold">Payment method</h3>
                  <p className="text-base-content/50 text-xs">
                    Visa ending in {cardNumber.slice(-4)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPayFormOpen((open) => !open)}
                className="btn btn-outline btn-sm">
                {payFormOpen ? 'Cancel' : 'Update'}
              </button>
            </div>
            {payFormOpen && (
              <div className="border-base-content/10 mt-4 grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="card-number" className="text-sm font-medium">
                    Card number
                  </label>
                  <input
                    id="card-number"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="card-expiry" className="text-sm font-medium">
                    Expiry
                  </label>
                  <input
                    id="card-expiry"
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button onClick={saveCard} className="btn btn-primary btn-sm">
                    <FiCheck />
                    Save card
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

BillingTemplate.displayName = 'BillingTemplate';
