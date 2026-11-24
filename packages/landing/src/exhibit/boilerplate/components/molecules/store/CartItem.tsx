'use client';

import type { FC } from 'react';

interface CartItemProps {
  name: string;
  price: number;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove?: () => void;
  imageLabel?: string;
  currency?: string;
}

export const CartItem: FC<CartItemProps> = ({
  name,
  price,
  quantity,
  onQuantityChange,
  onRemove,
  imageLabel = 'Item',
  currency = '$',
}) => (
  <div
    className="border-base-300 flex items-center gap-4 border-b py-4"
    data-testid="cart-item">
    <span className="bg-base-200 text-base-content/60 flex h-16 w-16 items-center justify-center rounded-lg text-xs">
      {imageLabel}
    </span>
    <div className="flex flex-1 flex-col gap-1">
      <span className="font-medium">{name}</span>
      <span className="text-base-content/60 text-sm">
        {currency}
        {price.toFixed(2)} each
      </span>
    </div>
    <div className="join">
      <button
        type="button"
        className="btn btn-ghost btn-sm join-item"
        aria-label="Decrease quantity"
        onClick={() => onQuantityChange(Math.max(0, quantity - 1))}>
        -
      </button>
      <span
        className="btn btn-ghost btn-sm join-item no-animation"
        data-testid="cart-item-quantity">
        {quantity}
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-sm join-item"
        aria-label="Increase quantity"
        onClick={() => onQuantityChange(quantity + 1)}>
        +
      </button>
    </div>
    <span
      className="w-20 text-right font-semibold"
      data-testid="cart-item-total">
      {currency}
      {(price * quantity).toFixed(2)}
    </span>
    {onRemove && (
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        aria-label={`Remove ${name}`}
        onClick={onRemove}>
        ✕
      </button>
    )}
  </div>
);
