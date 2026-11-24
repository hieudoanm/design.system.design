import type { FC } from 'react';

interface CheckoutSummaryProps {
  subtotal: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  total: number;
  itemCount?: number;
  currency?: string;
}

export const CheckoutSummary: FC<CheckoutSummaryProps> = ({
  subtotal,
  shipping = 0,
  tax = 0,
  discount = 0,
  total,
  itemCount,
  currency = '$',
}) => {
  const fmt = (value: number) => `${currency}${value.toFixed(2)}`;

  return (
    <div
      className="card bg-base-100 w-full shadow"
      data-testid="checkout-summary">
      <div className="card-body">
        <h3 className="card-title text-base">
          Order summary
          {itemCount !== undefined && (
            <span
              className="badge badge-ghost"
              data-testid="checkout-item-count">
              {itemCount} items
            </span>
          )}
        </h3>
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd data-testid="checkout-subtotal">{fmt(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{fmt(shipping)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Tax</dt>
            <dd>{fmt(tax)}</dd>
          </div>
          {discount > 0 && (
            <div className="text-success flex justify-between">
              <dt>Discount</dt>
              <dd>-{fmt(discount)}</dd>
            </div>
          )}
          <div className="border-base-300 flex justify-between border-t pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd data-testid="checkout-total">{fmt(total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
