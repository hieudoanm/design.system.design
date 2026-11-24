'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPlus, FiTrendingDown, FiTrendingUp, FiX } from 'react-icons/fi';

interface WatchItem {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
}

const INITIAL_ITEMS: WatchItem[] = [
  {
    id: 'NVDA',
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: '$133.20',
    change: '+1.9%',
  },
  {
    id: 'MSFT',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: '$431.80',
    change: '-0.7%',
  },
  {
    id: 'AMZN',
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: '$192.40',
    change: '+0.4%',
  },
];

const getChangeBadge = (change: string) => {
  const positive = change.startsWith('+');
  const Icon = positive ? FiTrendingUp : FiTrendingDown;
  return (
    <span
      className={`badge ${positive ? 'badge-success' : 'badge-error'} badge-sm gap-1`}>
      <Icon />
      {change}
    </span>
  );
};

export const WatchlistTemplate: FC = () => {
  const [items, setItems] = useState<WatchItem[]>(INITIAL_ITEMS);
  const [symbol, setSymbol] = useState('');

  const addSymbol = () => {
    if (!symbol.trim()) return;
    const next = symbol.trim().toUpperCase();
    setItems((prev) => [
      ...prev,
      {
        id: next,
        symbol: next,
        name: `${next} Holdings`,
        price: '$120.00',
        change: '+0.0%',
      },
    ]);
    setSymbol('');
  };

  const removeSymbol = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Track symbols without holding them.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base-content/50 text-sm">{items.length} symbols</p>
          <div className="flex gap-2">
            <input
              aria-label="Symbol ticker"
              placeholder="e.g. GOOG"
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              className="input input-bordered input-sm w-40"
            />
            <button
              onClick={addSymbol}
              className="btn btn-primary btn-sm gap-1">
              <FiPlus />
              Add symbol
            </button>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <ul className="divide-base-content/10 divide-y">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-16 font-mono text-sm font-medium">
                      {item.symbol}
                    </span>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{item.price}</span>
                    {getChangeBadge(item.change)}
                    <button
                      onClick={() => removeSymbol(item.id)}
                      className="btn btn-ghost btn-xs gap-1">
                      <FiX />
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

WatchlistTemplate.displayName = 'WatchlistTemplate';
