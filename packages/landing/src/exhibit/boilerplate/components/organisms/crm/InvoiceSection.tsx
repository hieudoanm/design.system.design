import type { FC } from 'react';

interface Invoice {
  id: string;
  number: string;
  customer?: string;
  amount: number;
  dueDate?: string;
  status?: 'paid' | 'pending' | 'overdue';
}

interface InvoiceSectionProps {
  invoices: Invoice[];
  title?: string;
}

const statusClass: Record<string, string> = {
  paid: 'badge-success',
  pending: 'badge-warning',
  overdue: 'badge-error',
};

const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

export const InvoiceSection: FC<InvoiceSectionProps> = ({
  invoices,
  title = 'Invoices',
}) => {
  const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <section className="py-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-xl">{title}</h2>
        <span className="badge badge-primary badge-lg">
          {formatAmount(total)}
        </span>
      </header>
      <div className="bg-base-200 border-base-content/10 overflow-x-auto rounded-xl border">
        <table className="table-zebra table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Due date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="text-base-content/50">
                  No invoices.
                </td>
              </tr>
            )}
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="font-mono text-sm">{invoice.number}</td>
                <td>{invoice.customer ?? '—'}</td>
                <td>{formatAmount(invoice.amount)}</td>
                <td>{invoice.dueDate ?? '—'}</td>
                <td>
                  {invoice.status && (
                    <span
                      className={`badge badge-sm ${
                        statusClass[invoice.status] ?? 'badge-ghost'
                      }`}>
                      {invoice.status}
                    </span>
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
