'use client';

import { type FC } from 'react';
import { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { LineItemRow, MoneyRow } from '@/exhibit/components/pos/molecules';
import { calculateSubtotal } from '@/exhibit/lib/pos';
import type { CartItem, Transaction } from '@/exhibit/types/pos';

interface CheckoutProps {
  items: CartItem[];
  onComplete: (transaction: Transaction) => void;
  onBack: () => void;
}

export const Checkout: FC<CheckoutProps> = ({ items, onComplete, onBack }) => {
  const [amountTendered, setAmountTendered] = useState('');

  const total = calculateSubtotal(items);
  const tendered = parseFloat(amountTendered) || 0;
  const change = tendered - total;
  const canComplete = tendered >= total;

  const complete = () => {
    if (!canComplete) return;
    onComplete({
      id: crypto.randomUUID(),
      items,
      subtotal: total,
      tax: 0,
      total,
      payments: [{ method: 'cash', amount: tendered }],
      status: 'completed',
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="btn btn-ghost btn-sm">
          <FiArrowLeft className="text-lg" />
        </button>
        <h2 className="text-sm font-bold">Checkout</h2>
      </div>

      <div className="border-base-300 bg-base-200 rounded-xl border p-4">
        <div className="flex flex-col gap-2">
          {items.map((ci) => (
            <LineItemRow key={ci.item.id} cartItem={ci} />
          ))}
        </div>
        <div className="border-base-content/20 mt-3 border-t pt-3">
          <MoneyRow label="Total" amount={total} tone="primary" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold">Amount Tendered</label>
        <input
          type="number"
          value={amountTendered}
          onChange={(e) => setAmountTendered(e.target.value)}
          placeholder="0.00"
          className="border-base-300 bg-base-200 input input-sm w-full"
          min="0"
          step="0.01"
        />
      </div>

      {amountTendered && (
        <div className="border-base-300 bg-base-200 rounded-xl border p-4">
          <MoneyRow
            label="Change"
            amount={change}
            tone={change >= 0 ? 'success' : 'error'}
          />
        </div>
      )}

      <button
        onClick={complete}
        disabled={!canComplete}
        className="btn btn-primary btn-sm w-full">
        Complete Payment
      </button>
    </div>
  );
};
