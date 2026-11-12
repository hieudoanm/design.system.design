'use client';

import { type FC, useState } from 'react';
import { EmptyState, Money, StatusBadge } from '@/exhibit/components/pos/atoms';
import {
  PanelHeader,
  SearchField,
  TransactionDetail,
} from '@/exhibit/components/pos/molecules';
import { filterTransactionsBySearch } from '@/exhibit/lib/pos';
import type { Transaction } from '@/exhibit/types/pos';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onBack: () => void;
  onVoid: (id: string) => void;
}

export const TransactionHistory: FC<TransactionHistoryProps> = ({
  transactions,
  onBack,
  onVoid,
}) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = filterTransactionsBySearch(transactions, search);
  const selected = selectedId
    ? transactions.find((t) => t.id === selectedId)
    : null;

  if (selected) {
    return (
      <TransactionDetail
        transaction={selected}
        onVoid={(id) => {
          onVoid(id);
          setSelectedId(null);
        }}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Transaction History" onBack={onBack}>
        <span className="text-base-content/50 text-xs">
          {transactions.length} transactions
        </span>
      </PanelHeader>
      <div className="border-base-300 border-b px-4 py-3">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search by ID or item..."
        />
      </div>
      <main className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <EmptyState className="py-20 text-center">
            No transactions found
          </EmptyState>
        ) : (
          <ul className="divide-base-300 divide-y">
            {filtered.map((t) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                onSelect={() => setSelectedId(t.id)}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

interface TransactionRowProps {
  transaction: Transaction;
  onSelect: () => void;
}

const TransactionRow: FC<TransactionRowProps> = ({ transaction, onSelect }) => (
  <li
    className="hover:bg-base-200 flex cursor-pointer items-center justify-between px-4 py-3 transition-colors"
    onClick={onSelect}>
    <div>
      <p className="font-mono text-xs">{transaction.id.slice(0, 8)}...</p>
      <p className="text-base-content/50 text-xs">
        {new Date(transaction.createdAt).toLocaleString()}
      </p>
    </div>
    <div className="text-right">
      <Money amount={transaction.total} className="text-sm font-bold" />
      <StatusBadge status={transaction.status} />
    </div>
  </li>
);
