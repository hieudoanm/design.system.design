import type { PaymentSplit } from '@/exhibit/types/pos';

export interface PaymentTotals {
  dueTotal: number;
  totalPaid: number;
  remaining: number;
  change: number;
  isSettled: boolean;
}

export const sumPaymentSplits = (splits: PaymentSplit[]): number =>
  splits.reduce((sum, p) => sum + p.amount, 0);

export const calculatePaymentTotals = (
  splits: PaymentSplit[],
  dueTotal: number
): PaymentTotals => {
  const totalPaid = sumPaymentSplits(splits);
  const remaining = Math.max(0, dueTotal - totalPaid);
  return {
    dueTotal,
    totalPaid,
    remaining,
    change: Math.max(0, totalPaid - dueTotal),
    isSettled: remaining <= 0.01 || totalPaid >= dueTotal,
  };
};
