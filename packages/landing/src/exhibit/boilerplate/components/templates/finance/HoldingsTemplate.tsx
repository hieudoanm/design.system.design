'use client';

import type { FC } from 'react';
import { useState } from 'react';

type AssetType = 'Stock' | 'ETF' | 'Crypto';
type HoldingFilter = 'All' | 'Stocks' | 'ETFs' | 'Crypto';

interface Holding {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  shares: string;
  price: string;
  value: string;
  allocation: number;
}

const HOLDINGS: Holding[] = [
  {
    id: 'h1',
    ticker: 'BTC',
    name: 'Bitcoin',
    type: 'Crypto',
    shares: '0.85',
    price: '$67,400',
    value: '$57,290',
    allocation: 46.6,
  },
  {
    id: 'h2',
    ticker: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    type: 'ETF',
    shares: '45',
    price: '$532.10',
    value: '$23,944.50',
    allocation: 19.4,
  },
  {
    id: 'h3',
    ticker: 'ETH',
    name: 'Ethereum',
    type: 'Crypto',
    shares: '6.5',
    price: '$3,480',
    value: '$22,620',
    allocation: 18.4,
  },
  {
    id: 'h4',
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    type: 'Stock',
    shares: '30',
    price: '$322.50',
    value: '$9,675',
    allocation: 7.9,
  },
  {
    id: 'h5',
    ticker: 'SCHD',
    name: 'Schwab Dividend ETF',
    type: 'ETF',
    shares: '80',
    price: '$84.20',
    value: '$6,736',
    allocation: 5.4,
  },
  {
    id: 'h6',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    type: 'Stock',
    shares: '12',
    price: '$232.40',
    value: '$2,788.80',
    allocation: 2.3,
  },
];

const FILTERS: HoldingFilter[] = ['All', 'Stocks', 'ETFs', 'Crypto'];

const matchesFilter = (holding: Holding, filter: HoldingFilter): boolean => {
  if (filter === 'All') return true;
  if (filter === 'Stocks') return holding.type === 'Stock';
  if (filter === 'ETFs') return holding.type === 'ETF';
  return holding.type === 'Crypto';
};

export const HoldingsTemplate: FC = () => {
  const [filter, setFilter] = useState<HoldingFilter>('All');

  const visible = HOLDINGS.filter((holding) => matchesFilter(holding, filter));

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Holdings</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Assets currently in your portfolio.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`tab ${filter === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">
            {visible.length} holdings
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Ticker</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 text-right font-medium">Shares</th>
                    <th className="px-4 py-3 text-right font-medium">Price</th>
                    <th className="px-4 py-3 text-right font-medium">Value</th>
                    <th className="px-4 py-3 font-medium">Allocation</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((holding) => (
                    <tr
                      key={holding.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 font-mono text-sm">
                        {holding.ticker}
                      </td>
                      <td className="px-4 py-3 text-sm">{holding.name}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        {holding.shares}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        {holding.price}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        {holding.value}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <progress
                            className="progress progress-primary h-1.5 w-16"
                            value={holding.allocation}
                            max={100}
                          />
                          <span className="text-xs">{holding.allocation}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

HoldingsTemplate.displayName = 'HoldingsTemplate';
