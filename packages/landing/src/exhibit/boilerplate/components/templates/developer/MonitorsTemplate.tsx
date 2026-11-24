'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiActivity, FiPause, FiPlay, FiRefreshCw } from 'react-icons/fi';

type MonitorStatus = 'Up' | 'Down' | 'Paused';

interface Monitor {
  id: string;
  name: string;
  url: string;
  status: MonitorStatus;
  uptime: number;
}

const MONITORS: Monitor[] = [
  {
    id: 'm1',
    name: 'Production API',
    url: 'https://api.acme.com',
    status: 'Up',
    uptime: 99.98,
  },
  {
    id: 'm2',
    name: 'Landing page',
    url: 'https://acme.com',
    status: 'Up',
    uptime: 99.92,
  },
  {
    id: 'm3',
    name: 'Checkout flow',
    url: 'https://acme.com/checkout',
    status: 'Down',
    uptime: 98.45,
  },
  {
    id: 'm4',
    name: 'Cron worker',
    url: 'https://cron.acme.com',
    status: 'Paused',
    uptime: 99.71,
  },
  {
    id: 'm5',
    name: 'CDN edge',
    url: 'https://cdn.acme.com',
    status: 'Up',
    uptime: 99.99,
  },
];

const getStatusBadge = (status: MonitorStatus) => {
  switch (status) {
    case 'Down':
      return <span className="badge badge-error badge-sm">Down</span>;
    case 'Paused':
      return <span className="badge badge-neutral badge-sm">Paused</span>;
    default:
      return <span className="badge badge-success badge-sm">Up</span>;
  }
};

export const MonitorsTemplate: FC = () => {
  const [monitors, setMonitors] = useState<Monitor[]>(MONITORS);

  const avgUptime = (
    MONITORS.reduce((sum, monitor) => sum + monitor.uptime, 0) / MONITORS.length
  ).toFixed(2);

  const setStatus = (id: string, status: MonitorStatus) => {
    setMonitors((prev) =>
      prev.map((monitor) =>
        monitor.id === id ? { ...monitor, status } : monitor
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Monitors</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Track service availability.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiActivity />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Uptime</p>
              <p className="text-2xl font-bold tracking-tight">{avgUptime}%</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Monitor</th>
                    <th className="px-4 py-3 font-medium">URL</th>
                    <th className="px-4 py-3 font-medium">Uptime</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monitors.map((monitor) => (
                    <tr
                      key={monitor.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {monitor.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {monitor.url}
                      </td>
                      <td className="px-4 py-3 text-sm">{monitor.uptime}%</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(monitor.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {monitor.status === 'Up' && (
                          <button
                            onClick={() => setStatus(monitor.id, 'Paused')}
                            className="btn btn-ghost btn-xs gap-1">
                            <FiPause />
                            Pause
                          </button>
                        )}
                        {monitor.status === 'Paused' && (
                          <button
                            onClick={() => setStatus(monitor.id, 'Up')}
                            className="btn btn-ghost btn-xs gap-1">
                            <FiPlay />
                            Resume
                          </button>
                        )}
                        {monitor.status === 'Down' && (
                          <button
                            onClick={() => setStatus(monitor.id, 'Up')}
                            className="btn btn-ghost btn-xs gap-1">
                            <FiRefreshCw />
                            Retry
                          </button>
                        )}
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

MonitorsTemplate.displayName = 'MonitorsTemplate';
