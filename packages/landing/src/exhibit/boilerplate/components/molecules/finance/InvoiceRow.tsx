import type { FC } from 'react';

type InvoiceStatus = 'paid' | 'pending' | 'overdue';

interface InvoiceRowProps {
  id: string;
  customer: string;
  amount: number;
  date: string;
  status?: InvoiceStatus;
  currency?: string;
  onSelect?: (id: string) => void;
}

const statusBadges: Record<InvoiceStatus, string> = {
  paid: 'badge-success',
  pending: 'badge-warning',
  overdue: 'badge-error',
};

export const InvoiceRow: FC<InvoiceRowProps> = ({
  id,
  customer,
  amount,
  date,
  status = 'pending',
  currency = '$',
  onSelect,
}) => (
  <button
    type="button"
    data-testid="invoice-row"
    onClick={() => onSelect?.(id)}
    className="hover:bg-base-200 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors">
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold">{customer}</p>
      <p className="text-base-content/50 font-mono text-xs">{id}</p>
    </div>
    <span className="text-base-content/50 text-xs">{date}</span>
    <span className={`badge ${statusBadges[status]}`}>{status}</span>
    <span
      className="font-mono text-sm font-semibold"
      data-testid="invoice-amount">
      {currency}
      {amount.toFixed(2)}
    </span>
  </button>
);
