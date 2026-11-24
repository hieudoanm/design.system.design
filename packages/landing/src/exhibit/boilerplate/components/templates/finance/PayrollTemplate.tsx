'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPlay } from 'react-icons/fi';

type RunStatus = 'Draft' | 'Paid';

interface PayrollRun {
  id: string;
  period: string;
  employees: number;
  total: number;
  status: RunStatus;
}

const INITIAL_RUNS: PayrollRun[] = [
  {
    id: 'r1',
    period: 'Aug 01, 2026',
    employees: 12,
    total: 24000,
    status: 'Paid',
  },
  {
    id: 'r2',
    period: 'Jul 15, 2026',
    employees: 11,
    total: 22000,
    status: 'Paid',
  },
  {
    id: 'r3',
    period: 'Jul 01, 2026',
    employees: 11,
    total: 22000,
    status: 'Draft',
  },
  {
    id: 'r4',
    period: 'Jun 15, 2026',
    employees: 10,
    total: 20000,
    status: 'Draft',
  },
];

const getStatusBadge = (status: RunStatus) => {
  if (status === 'Paid') {
    return <span className="badge badge-success badge-sm">Paid</span>;
  }
  return <span className="badge badge-warning badge-sm">Draft</span>;
};

export const PayrollTemplate: FC = () => {
  const [runs, setRuns] = useState<PayrollRun[]>(INITIAL_RUNS);
  const [message, setMessage] = useState<string | null>(null);

  const paidCount = runs.filter((run) => run.status === 'Paid').length;

  const runPayroll = () => {
    setRuns((prev) => [
      {
        id: `r${Date.now()}`,
        period: 'Aug 15, 2026',
        employees: 12,
        total: 24000,
        status: 'Paid',
      },
      ...prev,
    ]);
    setMessage('Payroll run completed');
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Process team payroll runs.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base-content/50 text-sm">
            {paidCount} of {runs.length} runs paid
          </p>
          <button onClick={runPayroll} className="btn btn-primary btn-sm gap-1">
            <FiPlay />
            Run payroll
          </button>
        </div>

        {message === 'Payroll run completed' && (
          <p className="text-success mb-4 text-sm">Payroll run completed</p>
        )}

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Employees
                    </th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr
                      key={run.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {run.period}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {run.employees}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        ${run.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(run.status)}
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

PayrollTemplate.displayName = 'PayrollTemplate';
