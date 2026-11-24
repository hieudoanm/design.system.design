'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiChevronRight,
  FiCreditCard,
  FiPlus,
  FiShoppingCart,
  FiTrash2,
} from 'react-icons/fi';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
  expired: boolean;
}

const initialMethods: PaymentMethod[] = [
  {
    id: '1',
    brand: 'Visa',
    last4: '4242',
    expiry: '12/27',
    isDefault: true,
    expired: false,
  },
  {
    id: '2',
    brand: 'Mastercard',
    last4: '5555',
    expiry: '08/25',
    isDefault: false,
    expired: true,
  },
];

let nextCardId = 3;

export const PaymentMethodsTemplate: FC = () => {
  const [methods, setMethods] = useState(initialMethods);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');

  const addCard = () => {
    if (cardNumber.trim() === '') {
      setError('Card number required');
      return;
    }
    const digits = cardNumber.replace(/\D/g, '');
    setMethods((prev) => [
      ...prev,
      {
        id: `card-${nextCardId++}`,
        brand: digits.startsWith('4') ? 'Visa' : 'Mastercard',
        last4: digits.slice(-4) || '0000',
        expiry: expiry.trim() || 'MM/YY',
        isDefault: prev.length === 0,
        expired: false,
      },
    ]);
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setError('');
  };

  const removeCard = (id: string) =>
    setMethods((prev) => prev.filter((method) => method.id !== id));

  const setDefault = (id: string) =>
    setMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );

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

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <div className="mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/store"
            className="text-base-content/50 hover:text-primary transition-colors">
            Store
          </Link>
          <FiChevronRight className="text-base-content/30 h-3 w-3" />
          <span>Payment methods</span>
        </div>

        {methods.length === 0 ? (
          <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-4 rounded-2xl border py-16 text-center">
            <FiCreditCard className="text-base-content/20 h-12 w-12" />
            <p className="text-base-content/50 text-sm">
              No saved payment methods
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {methods.map((method) => (
              <div
                key={method.id}
                className="border-base-content/10 bg-base-200 rounded-xl border p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                      <FiCreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {method.brand} ending in {method.last4}
                        </p>
                        {method.isDefault && (
                          <span className="badge badge-primary badge-sm">
                            Default
                          </span>
                        )}
                        {method.expired && (
                          <span className="badge badge-error badge-sm">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-base-content/50 text-sm">
                        Expires {method.expiry}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {!method.isDefault && (
                      <button
                        onClick={() => setDefault(method.id)}
                        className="btn btn-ghost btn-xs gap-1">
                        Set as default
                      </button>
                    )}
                    <button
                      onClick={() => removeCard(method.id)}
                      className="btn btn-ghost btn-xs text-error gap-1">
                      <FiTrash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-base-content/10 bg-base-200 mt-8 rounded-xl border p-6">
          <h2 className="mb-1 text-sm font-medium">Add a payment method</h2>
          <p className="text-base-content/50 mb-4 text-xs">
            Your card details are stored securely.
          </p>
          {error && <p className="text-error mb-3 text-sm">{error}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium">Card number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="input input-bordered"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Expiry</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="input input-bordered"
                placeholder="MM/YY"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">CVC</label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="input input-bordered"
                placeholder="123"
              />
            </div>
          </div>
          <button
            onClick={addCard}
            className="btn btn-primary btn-sm mt-4 gap-1">
            <FiPlus className="h-3 w-3" />
            Add card
          </button>
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

PaymentMethodsTemplate.displayName = 'PaymentMethodsTemplate';
