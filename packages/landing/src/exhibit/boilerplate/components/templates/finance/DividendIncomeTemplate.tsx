'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi';

interface DividendStock {
  id: string;
  ticker: string;
  name: string;
  yieldValue: string;
  amount: string;
}

const HOLDINGS: DividendStock[] = [
  {
    id: 'd1',
    ticker: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    yieldValue: '1.3%',
    amount: '$312.40',
  },
  {
    id: 'd2',
    ticker: 'SCHD',
    name: 'Schwab Dividend Equity',
    yieldValue: '3.4%',
    amount: '$186.25',
  },
  {
    id: 'd3',
    ticker: 'KO',
    name: 'Coca-Cola Co.',
    yieldValue: '2.9%',
    amount: '$92.80',
  },
  {
    id: 'd4',
    ticker: 'PEP',
    name: 'PepsiCo Inc.',
    yieldValue: '3.1%',
    amount: '$148.10',
  },
  {
    id: 'd5',
    ticker: 'JNJ',
    name: 'Johnson & Johnson',
    yieldValue: '3.0%',
    amount: '$134.55',
  },
];

export const DividendIncomeTemplate: FC = () => {
  const [reinvested, setReinvested] = useState(false);

  const annualTotal = HOLDINGS.reduce(
    (total, stock) => total + parseFloat(stock.amount.slice(1)),
    0
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Dividend Income</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Track quarterly payouts across your holdings.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="stat bg-base-200 border-base-content/10 rounded-xl border">
            <div className="stat-title">Annual income</div>
            <div className="stat-value text-2xl">
              $
              {annualTotal.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
          <div className="stat bg-base-200 border-base-content/10 rounded-xl border">
            <div className="stat-title">Avg. yield</div>
            <div className="stat-value text-2xl">2.7%</div>
          </div>
          <div className="stat bg-base-200 border-base-content/10 rounded-xl border">
            <div className="stat-title">Payments</div>
            <div className="stat-value text-2xl">20 / year</div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base-content/50 text-sm">
            {HOLDINGS.length} stocks
          </p>
          <button
            onClick={() => setReinvested((prev) => !prev)}
            className="btn btn-outline btn-sm gap-1">
            {reinvested ? <FiTrendingUp /> : <FiDollarSign />}
            {reinvested ? 'Reinvesting on' : 'Reinvest dividends'}
          </button>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Name</th>
                  <th>Yield</th>
                  <th>Annual payout</th>
                </tr>
              </thead>
              <tbody>
                {HOLDINGS.map((stock) => (
                  <tr key={stock.id}>
                    <td className="font-medium">{stock.ticker}</td>
                    <td className="text-base-content/70">{stock.name}</td>
                    <td>{stock.yieldValue}</td>
                    <td>{stock.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {reinvested && (
          <p className="text-base-content/50 mt-4 text-sm">
            Dividends will be automatically reinvested.
          </p>
        )}
      </main>
    </div>
  );
};

DividendIncomeTemplate.displayName = 'DividendIncomeTemplate';
