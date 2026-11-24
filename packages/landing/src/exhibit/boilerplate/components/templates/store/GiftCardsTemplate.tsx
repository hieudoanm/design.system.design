'use client';

import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiCheck,
  FiChevronRight,
  FiGift,
  FiShoppingCart,
} from 'react-icons/fi';

const amountOptions = [25, 50, 100];

export const GiftCardsTemplate: FC = () => {
  const [amount, setAmount] = useState(50);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [purchased, setPurchased] = useState(false);

  const handleBuy = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a valid email');
      return;
    }
    setError(null);
    setPurchased(true);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <Link href="/store/cart" className="btn btn-ghost btn-sm">
          <FiShoppingCart className="h-4 w-4" />
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-8">
          {purchased ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="bg-success/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                <FiCheck className="text-success h-6 w-6" />
              </div>
              <h2>Gift card purchased</h2>
              <p className="text-base-content/50 text-sm">
                A ${amount} gift card is on its way to {email}.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-col items-center gap-2 text-center">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <FiGift className="text-primary h-6 w-6" />
                </div>
                <h2>Gift cards</h2>
                <p className="text-base-content/50 text-sm">
                  Send a digital gift card to a friend.
                </p>
              </div>

              {error && (
                <div className="alert alert-error mb-6 text-sm">{error}</div>
              )}

              <form
                onSubmit={handleBuy}
                noValidate
                className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Amount</span>
                  <div className="grid grid-cols-3 gap-3">
                    {amountOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setAmount(option)}
                        aria-pressed={amount === option}
                        className={`btn btn-sm ${
                          amount === option ? 'btn-primary' : 'btn-outline'
                        }`}>
                        ${option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="recipient-email"
                    className="text-sm font-medium">
                    Recipient email
                  </label>
                  <input
                    id="recipient-email"
                    type="email"
                    placeholder="friend@example.com"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  Buy gift card
                </button>
              </form>
            </>
          )}
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

GiftCardsTemplate.displayName = 'GiftCardsTemplate';
