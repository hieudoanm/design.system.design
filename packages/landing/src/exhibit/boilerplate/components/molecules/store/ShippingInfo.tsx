import type { FC } from 'react';

interface ShippingInfoProps {
  method: string;
  eta: string;
  cost?: number;
  carrier?: string;
  currency?: string;
  free?: boolean;
}

export const ShippingInfo: FC<ShippingInfoProps> = ({
  method,
  eta,
  cost = 0,
  carrier,
  currency = '$',
  free = false,
}) => (
  <div
    className="border-base-300 flex items-start gap-3 rounded-xl border p-4"
    data-testid="shipping-info">
    <span className="text-xl">📦</span>
    <div className="flex flex-col gap-0.5">
      <span className="font-medium">{method}</span>
      <span className="text-base-content/70 text-sm">{eta}</span>
      {carrier && (
        <span className="text-base-content/50 text-xs">{carrier}</span>
      )}
    </div>
    <span className="ml-auto text-sm font-semibold" data-testid="shipping-cost">
      {free ? 'Free' : `${currency}${cost.toFixed(2)}`}
    </span>
  </div>
);
