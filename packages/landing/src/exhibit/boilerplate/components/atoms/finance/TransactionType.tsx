import type { FC } from 'react';

type TransactionTypeValue = 'income' | 'expense' | 'transfer';

interface TransactionTypeProps {
  type: TransactionTypeValue;
  className?: string;
}

const typeClass: Record<TransactionTypeValue, string> = {
  income: 'badge-success',
  expense: 'badge-error',
  transfer: 'badge-info',
};

const typeLabel: Record<TransactionTypeValue, string> = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer',
};

export const TransactionType: FC<TransactionTypeProps> = ({
  type,
  className = '',
}) => (
  <span
    data-testid="transaction-type"
    className={`badge badge-ghost ${typeClass[type]} ${className}`}>
    {typeLabel[type]}
  </span>
);
