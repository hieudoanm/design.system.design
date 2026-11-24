'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiShoppingCart,
  FiChevronRight,
  FiCheck,
  FiLock,
} from 'react-icons/fi';

export const CheckoutTemplate: FC = () => {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="bg-success/10 text-success flex h-20 w-20 items-center justify-center rounded-full">
          <FiCheck className="h-10 w-10" />
        </div>
        <h1 className="text-3xl">Order confirmed!</h1>
        <p className="text-base-content/50 max-w-md text-sm">
          Thank you for your purchase. You&apos;ll receive a confirmation email
          shortly.
        </p>
        <Link href="/store" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <Link href="/store/cart" className="btn btn-ghost btn-sm gap-1">
          <FiShoppingCart className="h-4 w-4" />
          Back to cart
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/store"
            className="text-base-content/50 hover:text-primary transition-colors">
            Store
          </Link>
          <FiChevronRight className="text-base-content/30 h-3 w-3" />
          <Link
            href="/store/cart"
            className="text-base-content/50 hover:text-primary transition-colors">
            Cart
          </Link>
          <FiChevronRight className="text-base-content/30 h-3 w-3" />
          <span>Checkout</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className="flex flex-col gap-6 lg:col-span-3">
            <div className="border-base-content/10 bg-base-200 rounded-2xl border p-6">
              <h2 className="mb-5 text-lg">Shipping information</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">First name</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Jane"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Last name</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="Doe"
                  />
                </div>
                <div className="sm:col-span-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Email</label>
                    <input
                      type="email"
                      className="input input-bordered"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Address</label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="123 Main St"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">City</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="San Francisco"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">ZIP code</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="94105"
                  />
                </div>
              </div>
            </div>

            <div className="border-base-content/10 bg-base-200 rounded-2xl border p-6">
              <h2 className="mb-5 text-lg">Payment</h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Card number</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="4242 4242 4242 4242"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Expiry</label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">CVC</label>
                    <input
                      type="text"
                      className="input input-bordered"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="border-base-content/10 bg-base-200 sticky top-24 rounded-2xl border p-6">
              <h3 className="mb-4 text-sm font-medium">Order summary</h3>
              {[
                { name: 'Ergonomic Chair', qty: 1, price: 349 },
                { name: 'Mechanical Keyboard', qty: 2, price: 318 },
                { name: 'Wireless Mouse', qty: 1, price: 79 },
              ].map((item) => (
                <div
                  key={item.name}
                  className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-base-content/60">
                    {item.name}{' '}
                    <span className="text-base-content/40">x{item.qty}</span>
                  </span>
                  <span>${item.price}</span>
                </div>
              ))}
              <div className="border-base-content/10 my-4 border-t" />
              <div className="flex justify-between text-sm">
                <span className="text-base-content/50">Subtotal</span>
                <span>$746</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/50">Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <div className="border-base-content/10 my-4 border-t" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>$746</span>
              </div>
              <button
                onClick={() => setSubmitted(true)}
                className="btn btn-primary mt-6 w-full gap-2">
                <FiLock className="h-4 w-4" />
                Pay $746
              </button>
              <p className="text-base-content/30 mt-3 text-center text-xs">
                Your payment is secured with end-to-end encryption.
              </p>
            </div>
          </div>
        </div>
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

CheckoutTemplate.displayName = 'CheckoutTemplate';
