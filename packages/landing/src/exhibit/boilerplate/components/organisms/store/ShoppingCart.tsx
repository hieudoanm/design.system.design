'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

interface ShoppingCartProps {
  items: CartItem[];
  onQuantityChange?: (id: string, qty: number) => void;
  onRemove?: (id: string) => void;
  onCheckout?: () => void;
}

export const ShoppingCart: FC<ShoppingCartProps> = ({
  items,
  onQuantityChange,
  onRemove,
  onCheckout,
}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.qty]))
  );

  const changeQuantity = (id: string, delta: number): void => {
    const next = Math.max(1, (quantities[id] ?? 1) + delta);
    setQuantities((prev) => ({ ...prev, [id]: next }));
    onQuantityChange?.(id, next);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * (quantities[item.id] ?? item.qty),
    0
  );

  if (items.length === 0) {
    return (
      <section data-testid="shopping-cart" className="card bg-base-200">
        <div className="card-body items-center text-center">
          <p className="text-base-content/60">Your cart is empty</p>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="shopping-cart" className="flex flex-col gap-4">
      <div className="card bg-base-200">
        <div className="card-body gap-2 p-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="border-base-content/10 flex items-center justify-between gap-3 border-b pb-3 last:border-b-0">
              <div>
                <h3 className="text-sm font-medium">{item.name}</h3>
                <p className="text-base-content/50 text-xs">
                  ${item.price.toFixed(2)} each
                </p>
              </div>
              <div className="join">
                <button
                  type="button"
                  className="btn btn-sm join-item"
                  aria-label={`Decrease quantity for ${item.name}`}
                  onClick={() => changeQuantity(item.id, -1)}>
                  -
                </button>
                <span
                  className="join-item flex w-10 items-center justify-center text-sm"
                  data-testid={`qty-${item.id}`}>
                  {quantities[item.id] ?? item.qty}
                </span>
                <button
                  type="button"
                  className="btn btn-sm join-item"
                  aria-label={`Increase quantity for ${item.name}`}
                  onClick={() => changeQuantity(item.id, 1)}>
                  +
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  ${((quantities[item.id] ?? item.qty) * item.price).toFixed(2)}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => onRemove?.(item.id)}>
                  &#10005;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base-content/50 text-xs">Subtotal</p>
          <p className="text-xl font-semibold" data-testid="subtotal">
            ${subtotal.toFixed(2)}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onCheckout}>
          Checkout
        </button>
      </div>
    </section>
  );
};
