import { type FC } from 'react';
import { Money, StatusBadge } from '@/exhibit/components/pos/atoms';
import { PanelHeader } from '@/exhibit/components/pos/molecules/PanelHeader';
import { TransactionTotals } from '@/exhibit/components/pos/molecules/TransactionTotals';
import { formatMoney } from '@/exhibit/lib/pos';
import type { Transaction } from '@/exhibit/types/pos';

interface TransactionDetailProps {
  transaction: Transaction;
  onVoid: (id: string) => void;
  onBack: () => void;
}

const formatPayments = (transaction: Transaction): string =>
  transaction.payments
    .map((p) => `${formatMoney(p.amount)} ${p.method}`)
    .join(', ');

export const TransactionDetail: FC<TransactionDetailProps> = ({
  transaction,
  onVoid,
  onBack,
}) => (
  <div className="flex h-full flex-col">
    <PanelHeader title="Transaction Detail" onBack={onBack} />
    <main className="min-h-0 flex-1 overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-base-content/50 text-xs">ID</p>
          <p className="font-mono text-xs">{transaction.id.slice(0, 8)}...</p>
        </div>
        <StatusBadge status={transaction.status} size="sm" />
      </div>
      <div className="mb-4">
        <p className="text-base-content/50 text-xs">Date</p>
        <p className="text-sm">
          {new Date(transaction.createdAt).toLocaleString()}
        </p>
      </div>
      <table className="table-sm table">
        <thead>
          <tr>
            <th>Item</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {transaction.items.map((ci, i) => (
            <tr key={i}>
              <td>{ci.item.name}</td>
              <td className="text-right">{ci.quantity}</td>
              <td className="text-right">
                <Money amount={ci.item.price * ci.quantity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="divider" />
      <TransactionTotals transaction={transaction} />
      <div className="mt-4 flex justify-between text-sm">
        <span>Payment</span>
        <span>{formatPayments(transaction)}</span>
      </div>
      {transaction.status === 'completed' && (
        <button
          className="btn btn-error btn-sm mt-6 w-full"
          onClick={() => onVoid(transaction.id)}>
          Void Transaction
        </button>
      )}
    </main>
  </div>
);
