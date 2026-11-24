'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiSettings } from 'react-icons/fi';

const RISK_OPTIONS = ['Conservative', 'Balanced', 'Aggressive'];
const CURRENCY_OPTIONS = ['USD', 'EUR', 'JPY'];

export const PortfolioSettingsTemplate: FC = () => {
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">
          Portfolio Settings
        </h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Configure your portfolio preferences.
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiSettings />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Preferences</p>
              <p className="text-2xl font-bold tracking-tight">4 preferences</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">Portfolio name</span>
              <input
                aria-label="Portfolio name"
                defaultValue="Growth Portfolio"
                className="input input-bordered w-full"
              />
            </label>

            <label className="mt-5 flex flex-col gap-2">
              <span className="text-sm font-medium">Risk tolerance</span>
              <select
                aria-label="Risk tolerance"
                defaultValue="Balanced"
                className="select select-bordered w-full">
                {RISK_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 flex flex-col gap-2">
              <span className="text-sm font-medium">Currency</span>
              <select
                aria-label="Currency"
                defaultValue="USD"
                className="select select-bordered w-full">
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Dividend reinvest</span>
              <input
                aria-label="Reinvest dividends"
                type="checkbox"
                className="toggle toggle-primary"
              />
            </label>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSaved((prev) => !prev)}
                className="btn btn-primary btn-sm gap-1">
                <FiCheck />
                {saved ? 'Settings saved' : 'Save settings'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

PortfolioSettingsTemplate.displayName = 'PortfolioSettingsTemplate';
