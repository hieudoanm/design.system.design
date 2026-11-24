'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

interface Statement {
  id: string;
  month: string;
  balance: number;
  activity: number;
}

const STATEMENTS: Statement[] = [
  { id: 'st1', month: 'July 2026', balance: 24800, activity: 142 },
  { id: 'st2', month: 'June 2026', balance: 22500, activity: 118 },
  { id: 'st3', month: 'May 2026', balance: 19800, activity: 96 },
  { id: 'st4', month: 'April 2026', balance: 21000, activity: 87 },
  { id: 'st5', month: 'March 2026', balance: 18600, activity: 105 },
];

export const StatementsTemplate: FC = () => {
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Statements</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Access monthly account statements.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {STATEMENTS.map((statement) => (
            <div
              key={statement.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{statement.month}</h3>
                  {downloadedId === statement.id && (
                    <p className="text-success text-xs">Statement downloaded</p>
                  )}
                </div>
                <p className="text-2xl font-bold tracking-tight">
                  ${statement.balance.toLocaleString()}
                </p>
                <p className="text-base-content/50 mt-1 mb-4 text-xs">
                  {statement.activity} transactions
                </p>
                {downloadedId === statement.id ? (
                  <span className="badge badge-success badge-sm">
                    Downloaded
                  </span>
                ) : (
                  <button
                    onClick={() => setDownloadedId(statement.id)}
                    className="btn btn-outline btn-sm gap-1">
                    <FiDownload />
                    Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

StatementsTemplate.displayName = 'StatementsTemplate';
