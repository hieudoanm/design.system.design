'use client';

import { type FC } from 'react';
import { useState } from 'react';
import { CodeApplyField, PanelHeader } from '@/exhibit/components/pos/molecules';
import {
  calculateDiscountAmount,
  calculatePaymentTotals,
  findActiveGiftCard,
  findRedeemableDiscount,
  formatMoney,
  getNextUnusedPaymentMethod,
} from '@/exhibit/lib/pos';
import type {
  Discount,
  GiftCard,
  PaymentMethod,
  PaymentSplit,
} from '@/exhibit/types/pos';

interface PaymentPanelProps {
  total: number;
  giftCards: GiftCard[];
  discounts: Discount[];
  onPayment: (payments: PaymentSplit[]) => void;
  onBack: () => void;
}

export const PaymentPanel: FC<PaymentPanelProps> = ({
  total,
  giftCards,
  discounts,
  onPayment,
  onBack,
}) => {
  const [splits, setSplits] = useState<PaymentSplit[]>([
    { method: 'cash', amount: 0 },
  ]);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [giftCardCode, setGiftCardCode] = useState('');

  const discountAmount = calculateDiscountAmount(appliedDiscount, total);
  const adjustedTotal = Math.max(0, total - discountAmount);
  const totals = calculatePaymentTotals(splits, adjustedTotal);

  const addSplit = () => {
    const method = getNextUnusedPaymentMethod(splits);
    if (method) setSplits([...splits, { method, amount: 0 }]);
  };

  const removeSplit = (index: number) => {
    setSplits(splits.filter((_, i) => i !== index));
  };

  const updateSplit = (
    index: number,
    field: keyof PaymentSplit,
    value: unknown
  ) => {
    const updated = [...splits];
    updated[index] = { ...updated[index], [field]: value };
    setSplits(updated);
  };

  const applyDiscount = () => {
    const discount = findRedeemableDiscount(discountCode, discounts, total);
    if (discount) setAppliedDiscount(discount);
  };

  const applyGiftCard = () => {
    const giftCard = findActiveGiftCard(giftCardCode, giftCards);
    if (!giftCard) return;
    const amount = Math.min(giftCard.balance, totals.remaining);
    setSplits([
      ...splits.filter((s) => s.method !== 'gift_card'),
      {
        method: 'gift_card' as PaymentMethod,
        amount,
        reference: giftCard.code,
      },
    ]);
  };

  return (
    <div className="flex h-full flex-col">
      <PanelHeader title="Payment" onBack={onBack} backLabel="Back" />

      <main className="min-h-0 flex-1 overflow-y-auto p-4">
        <TotalDue total={adjustedTotal} discountAmount={discountAmount} />

        <CodeApplyField
          label="Discount Code"
          placeholder="Enter code"
          value={discountCode}
          onChange={setDiscountCode}
          onApply={applyDiscount}
          feedback={
            appliedDiscount
              ? `Applied: ${appliedDiscount.code} (${describeDiscount(
                  appliedDiscount
                )} off)`
              : undefined
          }
        />

        <CodeApplyField
          label="Gift Card"
          placeholder="Gift card code"
          value={giftCardCode}
          onChange={setGiftCardCode}
          onApply={applyGiftCard}
        />

        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Payment Methods</h2>
            {splits.length < 3 && (
              <button className="btn btn-ghost btn-xs" onClick={addSplit}>
                + Add
              </button>
            )}
          </div>

          {splits.map((split, i) => (
            <div key={i} className="mb-2 flex items-center gap-2">
              <select
                className="select select-bordered select-sm"
                value={split.method}
                onChange={(e) =>
                  updateSplit(i, 'method', e.target.value as PaymentMethod)
                }>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="gift_card">Gift Card</option>
              </select>
              <input
                type="number"
                className="input input-bordered input-sm flex-1"
                value={split.amount || ''}
                onChange={(e) =>
                  updateSplit(i, 'amount', Number(e.target.value))
                }
                min={0}
                step={0.01}
                placeholder="0.00"
              />
              {splits.length > 1 && (
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => removeSplit(i)}>
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-base-200 rounded p-3">
          <div className="flex justify-between text-sm">
            <span>Paid</span>
            <span>{formatMoney(totals.totalPaid)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Remaining</span>
            <span
              className={
                totals.remaining > 0 ? 'text-warning' : 'text-success'
              }>
              {formatMoney(totals.remaining)}
            </span>
          </div>
          {totals.change > 0 && (
            <div className="flex justify-between text-sm font-bold">
              <span>Change</span>
              <span className="text-success">{formatMoney(totals.change)}</span>
            </div>
          )}
        </div>
      </main>

      <div className="border-base-300 border-t p-4">
        <button
          className="btn btn-primary w-full"
          disabled={!totals.isSettled}
          onClick={() => onPayment(splits)}>
          Complete Payment
        </button>
      </div>
    </div>
  );
};

interface TotalDueProps {
  total: number;
  discountAmount: number;
}

const TotalDue: FC<TotalDueProps> = ({ total, discountAmount }) => (
  <div className="mb-4">
    <div className="bg-base-200 mb-2 rounded p-3 text-center">
      <p className="text-base-content/50 text-xs">Total Due</p>
      <p className="text-2xl font-bold">{formatMoney(total)}</p>
      {discountAmount > 0 && (
        <p className="text-success text-xs">
          Discount: -{formatMoney(discountAmount)}
        </p>
      )}
    </div>
  </div>
);

const describeDiscount = (discount: Discount): string =>
  discount.type === 'percentage'
    ? `${discount.value}%`
    : formatMoney(discount.value);
