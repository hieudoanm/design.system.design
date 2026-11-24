'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiMapPin } from 'react-icons/fi';

interface Tax {
  id: string;
  region: string;
  rate: number;
  enabled: boolean;
}

const TAXES: Tax[] = [
  { id: 'tx1', region: 'California', rate: 7.25, enabled: true },
  { id: 'tx2', region: 'Texas', rate: 6.25, enabled: true },
  { id: 'tx3', region: 'New York', rate: 8.875, enabled: true },
  { id: 'tx4', region: 'Washington', rate: 6.5, enabled: false },
  { id: 'tx5', region: 'Florida', rate: 6, enabled: true },
  { id: 'tx6', region: 'Illinois', rate: 6.25, enabled: false },
];

export const TaxesTemplate: FC = () => {
  const [taxes, setTaxes] = useState<Tax[]>(TAXES);

  const enabledCount = taxes.filter((tax) => tax.enabled).length;

  const toggleTax = (id: string) => {
    setTaxes((prev) =>
      prev.map((tax) =>
        tax.id === id ? { ...tax, enabled: !tax.enabled } : tax
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Taxes</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Configure sales tax rates by region.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiMapPin />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Regions</p>
              <p className="text-2xl font-bold tracking-tight">
                {enabledCount} regions enabled
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Region</th>
                    <th className="px-4 py-3 font-medium">Rate</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {taxes.map((tax) => (
                    <tr
                      key={tax.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {tax.region}
                      </td>
                      <td className="px-4 py-3 text-sm">{tax.rate}%</td>
                      <td className="px-4 py-3">
                        {tax.enabled ? (
                          <span className="badge badge-success badge-sm">
                            Enabled
                          </span>
                        ) : (
                          <span className="badge badge-neutral badge-sm">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="checkbox"
                          checked={tax.enabled}
                          onChange={() => toggleTax(tax.id)}
                          aria-label={`Enable ${tax.region}`}
                          className="checkbox checkbox-primary checkbox-sm"
                        />
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

TaxesTemplate.displayName = 'TaxesTemplate';
