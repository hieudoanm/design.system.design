'use client';

import type { FC } from 'react';
import { useState } from 'react';
import type { IconType } from 'react-icons';
import {
  FiCheck,
  FiDollarSign,
  FiPercent,
  FiPlus,
  FiTrendingDown,
  FiTrendingUp,
} from 'react-icons/fi';

interface Holding {
  ticker: string;
  name: string;
  value: string;
}

interface StatCardProps {
  icon: IconType;
  label: string;
  value: string;
  hint: string;
  positive?: boolean;
}

const HOLDINGS: Holding[] = [
  { ticker: 'BTC', name: 'Bitcoin', value: '$57,290' },
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', value: '$23,944.50' },
  { ticker: 'ETH', name: 'Ethereum', value: '$22,620' },
  { ticker: 'TSLA', name: 'Tesla Inc.', value: '$9,675' },
];

const StatCard: FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  hint,
  positive,
}) => (
  <div className="card bg-base-200 border-base-content/10 border">
    <div className="card-body p-5">
      <div className="flex items-center justify-between">
        <p className="text-base-content/50 text-xs">{label}</p>
        <Icon className="text-base-content/40" />
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p
        className={
          positive ? 'text-success text-xs' : 'text-base-content/50 text-xs'
        }>
        {hint}
      </p>
    </div>
  </div>
);

export const PortfolioOverviewTemplate: FC = () => {
  const [transferring, setTransferring] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">
          Portfolio Overview
        </h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Summary of your investment portfolio.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base-content/50 text-sm">6 holdings</p>
          <button
            onClick={() => setTransferring((prev) => !prev)}
            className="btn btn-primary btn-sm gap-1">
            {transferring ? <FiCheck /> : <FiPlus />}
            {transferring ? 'Transfer scheduled' : 'Add funds'}
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FiDollarSign}
            label="Total Value"
            value="$128,450"
            hint="Across 6 holdings"
          />
          <StatCard
            icon={FiTrendingUp}
            label="Total Gain"
            value="+$12,340"
            hint="+10.6% all time"
            positive
          />
          <StatCard
            icon={FiTrendingDown}
            label="Day Change"
            value="-$840"
            hint="-0.65% today"
          />
          <StatCard
            icon={FiPercent}
            label="Dividend Yield"
            value="1.8%"
            hint="Last 12 months"
          />
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <h2 className="mb-4 text-lg font-semibold">Top holdings</h2>
            <ul className="space-y-3">
              {HOLDINGS.map((holding) => (
                <li
                  key={holding.ticker}
                  className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base-content/40 font-mono text-sm">
                      {holding.ticker}
                    </span>
                    <span className="text-sm">{holding.name}</span>
                  </div>
                  <span className="text-sm font-medium">{holding.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

PortfolioOverviewTemplate.displayName = 'PortfolioOverviewTemplate';
