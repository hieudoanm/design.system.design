'use client';

import { type FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiPrinter } from 'react-icons/fi';
import { Money } from '@/exhibit/components/pos/atoms';
import { TransactionTotals } from '@/exhibit/components/pos/molecules';
import { buildReceiptText, downloadTextFile, formatMoney } from '@/exhibit/lib/pos';
import type { Transaction } from '@/exhibit/types/pos';

interface DigitalReceiptProps {
  transaction: Transaction;
  onNewSale: () => void;
}

export const DigitalReceipt: FC<DigitalReceiptProps> = ({
  transaction,
  onNewSale,
}) => {
  const [printAttempted, setPrintAttempted] = useState(false);

  const handlePrint = () => {
    setPrintAttempted(true);
    downloadTextFile(
      buildReceiptText(transaction),
      `receipt-${transaction.id.slice(0, 8)}.txt`,
      'text/plain'
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="bg-base-200 w-full max-w-sm rounded-lg p-6 shadow">
        <div className="mb-4 flex flex-col items-center">
          <FiCheck className="text-success mb-2 size-12" />
          <h1 className="text-lg font-bold">Payment Complete</h1>
        </div>

        <div className="text-base-content/50 mb-4 text-xs">
          <p>ID: {transaction.id.slice(0, 8)}...</p>
          <p>{new Date(transaction.createdAt).toLocaleString()}</p>
        </div>

        <table className="table-sm table">
          <tbody>
            {transaction.items.map((ci, i) => (
              <tr key={i}>
                <td>
                  {ci.item.name} × {ci.quantity}
                </td>
                <td className="text-right">
                  <Money amount={ci.item.price * ci.quantity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="divider my-1" />

        <TransactionTotals transaction={transaction} />

        <div className="divider my-1" />

        {transaction.payments.map((p, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="capitalize">{p.method.replace('_', ' ')}</span>
            <span>{formatMoney(p.amount)}</span>
          </div>
        ))}

        <div className="mt-4 flex gap-2">
          <button
            className="btn btn-outline btn-sm flex-1"
            onClick={handlePrint}>
            <FiPrinter className="size-4" />
            {printAttempted ? 'Downloaded' : 'Download'}
          </button>
          <button className="btn btn-primary btn-sm flex-1" onClick={onNewSale}>
            New Sale
          </button>
        </div>
      </div>
    </div>
  );
};
