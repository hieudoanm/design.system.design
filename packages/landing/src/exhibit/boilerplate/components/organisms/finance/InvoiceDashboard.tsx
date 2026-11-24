import type { FC } from 'react';

type InvoiceStatus = 'paid' | 'pending' | 'overdue';

interface Invoice {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

interface InvoiceDashboardProps {
  invoices: Invoice[];
  currency?: string;
  title?: string;
}

const statusBadge: Record<InvoiceStatus, string> = {
  paid: 'badge-success',
  pending: 'badge-warning',
  overdue: 'badge-error',
};

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const InvoiceDashboard: FC<InvoiceDashboardProps> = ({
  invoices,
  currency = 'USD',
  title = 'Invoice dashboard',
}) => {
  const totalOutstanding = invoices
    .filter((invoice) => invoice.status !== 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <section className="card bg-base-200 w-full">
      <div className="card-body flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="card-title">{title}</h3>
          <span className="badge badge-warning" data-testid="outstanding">
            {formatAmount(totalOutstanding, currency)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['paid', 'pending', 'overdue'] as const).map((status) => (
            <div
              key={status}
              className="bg-base-100 rounded-xl p-3 text-center">
              <p className="text-2xl">
                {invoices.filter((invoice) => invoice.status === status).length}
              </p>
              <p className="text-base-content/50 text-xs capitalize">
                {status}
              </p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table data-testid="invoices-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Client</th>
                <th>Due date</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-mono text-xs">{invoice.id}</td>
                  <td className="font-medium">{invoice.client}</td>
                  <td className="text-base-content/60">{invoice.dueDate}</td>
                  <td className="text-right">
                    {formatAmount(invoice.amount, currency)}
                  </td>
                  <td>
                    <span
                      className={`badge badge-sm ${statusBadge[invoice.status]}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
