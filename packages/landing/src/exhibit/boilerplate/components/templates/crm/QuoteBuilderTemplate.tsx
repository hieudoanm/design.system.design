'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiDollarSign, FiPlus, FiTrash2 } from 'react-icons/fi';

interface LineItem {
  id: number;
  name: string;
  price: number;
}

export const QuoteBuilderTemplate: FC = () => {
  const [items, setItems] = useState<LineItem[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const addItem = () => {
    const trimmedName = name.trim();
    const priceValue = Number(price);
    if (trimmedName === '') {
      setAdded(false);
      setError('Enter an item name');
      return;
    }
    if (price.trim() === '' || Number.isNaN(priceValue) || priceValue < 0) {
      setAdded(false);
      setError('Enter a valid price');
      return;
    }
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name: trimmedName, price: priceValue },
    ]);
    setName('');
    setPrice('');
    setError(null);
    setAdded(true);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Quote Builder</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Build a customer quote.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Setup fee"
                aria-label="Item name"
                className="input input-bordered input-sm flex-1"
              />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 500"
                aria-label="Item price"
                className="input input-bordered input-sm flex-1"
              />
              <button
                type="button"
                onClick={addItem}
                className="btn btn-primary btn-sm gap-1">
                <FiPlus />
                Add item
              </button>
            </div>
            {error && (
              <p className="text-error mt-3 text-sm" role="alert">
                {error}
              </p>
            )}
            {added && !error && (
              <p className="text-success mt-3 text-sm">Item added</p>
            )}
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body p-0">
            {items.length === 0 ? (
              <p className="text-base-content/50 px-4 py-6 text-sm">
                No items yet
              </p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="border-base-content/10 flex items-center justify-between gap-3 border-b p-4 last:border-b-0">
                  <p className="text-sm">
                    {item.name} — ${item.price.toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setItems((prev) =>
                        prev.filter((line) => line.id !== item.id)
                      )
                    }
                    className="btn btn-ghost btn-xs gap-1">
                    <FiTrash2 />
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiDollarSign />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Total</p>
              <p className="text-2xl font-bold tracking-tight">
                ${total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

QuoteBuilderTemplate.displayName = 'QuoteBuilderTemplate';
