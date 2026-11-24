'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiShoppingCart,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiChevronRight,
  FiArrowLeft,
} from 'react-icons/fi';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const initialItems: CartItem[] = [
  { id: '1', name: 'Ergonomic Chair', price: 349, quantity: 1 },
  { id: '2', name: 'Mechanical Keyboard', price: 159, quantity: 2 },
  { id: '5', name: 'Wireless Mouse', price: 79, quantity: 1 },
];

export const CartTemplate: FC = () => {
  const [items, setItems] = useState(initialItems);

  const updateQty = (id: string, delta: number) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <Link href="/store" className="btn btn-ghost btn-sm gap-1">
          <FiArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-center gap-2">
          <Link
            href="/store"
            className="text-base-content/50 hover:text-primary text-sm transition-colors">
            Store
          </Link>
          <FiChevronRight className="text-base-content/30 h-3 w-3" />
          <span className="text-sm">Cart ({items.length})</span>
        </div>

        {items.length === 0 ? (
          <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-4 rounded-2xl border py-24 text-center">
            <FiShoppingCart className="text-base-content/20 h-12 w-12" />
            <p className="text-base-content/50 text-sm">Your cart is empty.</p>
            <Link href="/store" className="btn btn-primary btn-sm">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex flex-1 flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border-base-content/10 bg-base-200 flex items-center gap-4 rounded-xl border p-4">
                  <div className="bg-base-300 flex h-16 w-16 shrink-0 items-center justify-center rounded-lg">
                    <FiShoppingCart className="text-base-content/20 h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-base-content/50 mt-0.5 text-sm">
                      ${item.price}
                    </p>
                  </div>
                  <div className="join">
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => updateQty(item.id, -1)}
                      disabled={item.quantity <= 1}>
                      <FiMinus className="h-3 w-3" />
                    </button>
                    <span className="join-item flex min-w-[2.5rem] items-center justify-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="join-item btn btn-sm"
                      onClick={() => updateQty(item.id, 1)}>
                      <FiPlus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="w-20 text-right text-sm font-medium">
                    ${item.price * item.quantity}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="btn btn-ghost btn-sm text-error">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-base-content/10 bg-base-200 h-fit w-full shrink-0 rounded-xl border p-6 lg:w-72">
              <h3 className="mb-4 text-sm font-medium">Order summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/50">Subtotal</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/50">Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <div className="border-base-content/10 my-4 border-t" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${subtotal}</span>
              </div>
              <Link
                href="/store/checkout"
                className="btn btn-primary mt-6 w-full">
                Checkout &mdash; ${subtotal}
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="border-base-300 border-t px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-primary text-lg font-bold tracking-tight">
            Boilerplate
          </p>
          <p className="text-base-content/50 text-xs">
            &copy; {new Date().getFullYear()} Boilerplate Store &middot; Built
            with care
          </p>
        </div>
      </footer>
    </div>
  );
};

CartTemplate.displayName = 'CartTemplate';
