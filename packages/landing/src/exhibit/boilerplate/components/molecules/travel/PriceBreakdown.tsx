import type { FC } from 'react';

interface PriceBreakdownItem {
  label: string;
  amount: number;
}

interface PriceBreakdownProps {
  items: PriceBreakdownItem[];
  currency?: string;
  title?: string;
}

export const PriceBreakdown: FC<PriceBreakdownProps> = ({
  items,
  currency = '$',
  title = 'Price breakdown',
}) => {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const fmt = (value: number) => `${currency}${value.toFixed(2)}`;

  return (
    <div
      className="card bg-base-100 w-full shadow"
      data-testid="price-breakdown">
      <div className="card-body">
        <h3 className="card-title text-base">{title}</h3>
        <dl className="flex flex-col gap-1 text-sm">
          {items.map((item) => (
            <div key={item.label} className="flex justify-between">
              <dt className="text-base-content/70">{item.label}</dt>
              <dd>{fmt(item.amount)}</dd>
            </div>
          ))}
          <div className="border-base-300 flex justify-between border-t pt-2 font-semibold">
            <dt>Total</dt>
            <dd data-testid="price-breakdown-total">{fmt(total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
