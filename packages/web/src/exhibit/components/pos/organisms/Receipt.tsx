import { type FC } from 'react';
import { Money, SuccessMark } from '@/exhibit/components/pos/atoms';
import { LineItemRow, MoneyRow } from '@/exhibit/components/pos/molecules';
import type { Transaction } from '@/exhibit/types/pos';

interface ReceiptProps {
  transaction: Transaction;
  onNewSale: () => void;
}

export const Receipt: FC<ReceiptProps> = ({ transaction, onNewSale }) => (
  <div className="flex flex-col items-center gap-4">
    <SuccessMark />

    <h2 className="text-sm font-bold">Payment Complete</h2>

    <div className="border-base-300 bg-base-200 w-full max-w-sm rounded-xl border p-4">
      <div className="flex flex-col gap-2">
        {transaction.items.map((ci) => (
          <LineItemRow key={ci.item.id} cartItem={ci} />
        ))}
      </div>

      <div className="border-base-content/20 mt-3 border-t pt-3">
        <MoneyRow label="Total" amount={transaction.total} tone="primary" />
      </div>

      <div className="border-base-content/20 mt-3 border-t pt-3">
        {transaction.payments.map((p, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm capitalize">
              {p.method.replace('_', ' ')}
            </span>
            <Money amount={p.amount} className="text-sm" />
          </div>
        ))}
      </div>
    </div>

    <button onClick={onNewSale} className="btn btn-primary btn-sm">
      New Sale
    </button>
  </div>
);
