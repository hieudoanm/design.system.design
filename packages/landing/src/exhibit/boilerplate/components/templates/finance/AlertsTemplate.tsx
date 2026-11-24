'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiBell, FiCheck, FiPause, FiPlay, FiPlus } from 'react-icons/fi';

type AlertStatus = 'Active' | 'Paused' | 'Triggered';

interface PriceAlert {
  id: string;
  ticker: string;
  condition: string;
  status: AlertStatus;
}

const INITIAL_ALERTS: PriceAlert[] = [
  { id: 'a1', ticker: 'AAPL', condition: 'above $250', status: 'Active' },
  { id: 'a2', ticker: 'BTC', condition: 'below $55,000', status: 'Active' },
  { id: 'a3', ticker: 'TSLA', condition: 'above $400', status: 'Triggered' },
  { id: 'a4', ticker: 'VOO', condition: 'below $480', status: 'Active' },
];

const getStatusBadge = (status: AlertStatus) => {
  switch (status) {
    case 'Paused':
      return <span className="badge badge-warning badge-sm">Paused</span>;
    case 'Triggered':
      return <span className="badge badge-error badge-sm">Triggered</span>;
    default:
      return <span className="badge badge-success badge-sm">Active</span>;
  }
};

export const AlertsTemplate: FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>(INITIAL_ALERTS);
  const [created, setCreated] = useState(false);

  const toggle = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? {
              ...alert,
              status: alert.status === 'Active' ? 'Paused' : 'Active',
            }
          : alert
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Notify me when prices cross a level.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base-content/50 text-sm">{alerts.length} alerts</p>
          <button
            onClick={() => setCreated((prev) => !prev)}
            className="btn btn-primary btn-sm gap-1">
            {created ? <FiCheck /> : <FiPlus />}
            {created ? 'Alert created' : 'New alert'}
          </button>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <ul className="divide-base-content/10 divide-y">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-center justify-between gap-3 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/10 rounded-lg p-2 text-sm">
                      <FiBell />
                    </span>
                    <span className="text-sm font-medium">
                      {alert.ticker} {alert.condition}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(alert.status)}
                    {alert.status !== 'Triggered' && (
                      <button
                        onClick={() => toggle(alert.id)}
                        className="btn btn-ghost btn-xs gap-1">
                        {alert.status === 'Active' ? <FiPause /> : <FiPlay />}
                        {alert.status === 'Active' ? 'Pause' : 'Resume'}
                      </button>
                    )}
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

AlertsTemplate.displayName = 'AlertsTemplate';
