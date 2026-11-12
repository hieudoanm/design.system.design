import { type FC } from 'react';
import { Money } from '@/exhibit/components/pos/atoms';
import type { PaymentMethodTotals } from '@/exhibit/lib/pos';

export const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  gift_card: 'Gift Card',
};

interface PaymentBreakdownProps {
  byPayment: PaymentMethodTotals;
  labels?: Record<string, string>;
  capitalize?: boolean;
}

export const PaymentBreakdown: FC<PaymentBreakdownProps> = ({
  byPayment,
  labels,
  capitalize = false,
}) => (
  <div className="mb-4 grid grid-cols-3 gap-2">
    {Object.entries(byPayment).map(([method, amount]) => (
      <div key={method} className="bg-base-200 rounded p-3 text-center">
        <p
          className={`text-base-content/50 text-xs ${
            capitalize ? 'capitalize' : ''
          }`.trim()}>
          {labels?.[method] ?? method.replace('_', ' ')}
        </p>
        <p className="text-sm font-bold">
          <Money amount={amount} />
        </p>
      </div>
    ))}
  </div>
);
