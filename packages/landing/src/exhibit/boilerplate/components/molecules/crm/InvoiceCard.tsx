import type { FC } from 'react';

interface InvoiceItem {
  label: string;
  amount: number;
}

interface InvoiceCardProps {
  id: string;
  customer: string;
  items: InvoiceItem[];
  status: 'Pending' | 'Paid' | 'Overdue';
  currency?: string;
}

const statusBadge: Record<InvoiceCardProps['status'], string> = {
  Pending: 'badge-warning',
  Paid: 'badge-success',
  Overdue: 'badge-error',
};

export const InvoiceCard: FC<InvoiceCardProps> = ({
  id,
  customer,
  items,
  status,
  currency = '$',
}) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <article data-testid="invoice-card" className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="card-title">Invoice {id}</h3>
            <p className="text-base-content/60 text-sm">{customer}</p>
          </div>
          <div className={`badge ${statusBadge[status]}`}>{status}</div>
        </div>
        <ul className="divide-base-content/10 mt-2 divide-y text-sm">
          {items.map((item) => (
            <li key={item.label} className="flex justify-between py-2">
              <span>{item.label}</span>
              <span>
                {currency}
                {item.amount.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
        <div className="border-base-content/10 flex justify-between border-t pt-3 font-medium">
          <span>Total</span>
          <span>
            {currency}
            {total.toLocaleString()}
          </span>
        </div>
      </div>
    </article>
  );
};

InvoiceCard.displayName = 'InvoiceCard';
