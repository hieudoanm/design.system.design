import { FC } from 'react';
import type { Transaction } from '@/exhibit/types/wallet';
import { formatCurrency, formatDateTime } from '@/exhibit/lib/wallet/format';
import { getTransactionIcon } from '@/exhibit/lib/wallet/iconMap';

interface TransactionItemProps {
  transaction: Transaction;
  showDate?: boolean;
}

const TransactionItem: FC<TransactionItemProps> = ({
  transaction: tx,
  showDate = true,
}) => {
  const Icon = getTransactionIcon(tx.category);

  return (
    <div className="bg-base-200 flex items-center justify-between rounded-xl p-4">
      <div className="flex items-center gap-3">
        <Icon className="text-primary text-2xl" />
        <div>
          <p className="font-medium">{tx.title}</p>
          <p className="text-base-content/60 text-xs">
            {tx.category}
            {showDate && ` · ${formatDateTime(tx.date)}`}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-semibold ${
            tx.amount >= 0 ? 'text-success' : 'text-error'
          }`}>
          {tx.amount >= 0 ? '+' : ''}
          {formatCurrency(tx.amount)}
        </p>
      </div>
    </div>
  );
};

export default TransactionItem;
