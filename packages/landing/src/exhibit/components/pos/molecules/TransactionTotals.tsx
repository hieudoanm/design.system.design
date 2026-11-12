import { type FC } from 'react';
import { Money } from '@/exhibit/components/pos/atoms';
import type { Transaction } from '@/exhibit/types/pos';

interface TransactionTotalsProps {
  transaction: Transaction;
}

export const TransactionTotals: FC<TransactionTotalsProps> = ({
  transaction,
}) => (
  <>
    <div className="flex justify-between text-sm">
      <span>Subtotal</span>
      <span>
        <Money amount={transaction.subtotal} />
      </span>
    </div>
    <div className="flex justify-between text-sm">
      <span>Tax</span>
      <span>
        <Money amount={transaction.tax} />
      </span>
    </div>
    <div className="flex justify-between font-bold">
      <span>Total</span>
      <span>
        <Money amount={transaction.total} />
      </span>
    </div>
  </>
);
