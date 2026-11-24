'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiRefreshCw, FiServer, FiTool } from 'react-icons/fi';

type EnvironmentStatus = 'Healthy' | 'Warning' | 'Down';
type EnvironmentFilter = 'All' | EnvironmentStatus;

interface Environment {
  id: string;
  name: string;
  url: string;
  status: EnvironmentStatus;
  lastDeploy: string;
}

const ENVIRONMENTS: Environment[] = [
  {
    id: 'e1',
    name: 'Production',
    url: 'https://app.acme.com',
    status: 'Healthy',
    lastDeploy: 'Aug 7, 2026',
  },
  {
    id: 'e2',
    name: 'Staging',
    url: 'https://staging.acme.com',
    status: 'Healthy',
    lastDeploy: 'Aug 6, 2026',
  },
  {
    id: 'e3',
    name: 'Development',
    url: 'https://dev.acme.com',
    status: 'Healthy',
    lastDeploy: 'Aug 5, 2026',
  },
  {
    id: 'e4',
    name: 'Review',
    url: 'https://review.acme.com',
    status: 'Warning',
    lastDeploy: 'Aug 4, 2026',
  },
  {
    id: 'e5',
    name: 'Sandbox',
    url: 'https://sandbox.acme.com',
    status: 'Down',
    lastDeploy: 'Aug 3, 2026',
  },
];

const FILTERS: EnvironmentFilter[] = ['All', 'Healthy', 'Warning', 'Down'];

const getStatusBadge = (status: EnvironmentStatus) => {
  switch (status) {
    case 'Warning':
      return <span className="badge badge-warning badge-sm">Warning</span>;
    case 'Down':
      return <span className="badge badge-error badge-sm">Down</span>;
    default:
      return <span className="badge badge-success badge-sm">Healthy</span>;
  }
};

export const EnvironmentsTemplate: FC = () => {
  const [environments, setEnvironments] = useState<Environment[]>(ENVIRONMENTS);
  const [filter, setFilter] = useState<EnvironmentFilter>('All');

  const visible = environments.filter(
    (environment) => filter === 'All' || environment.status === filter
  );

  const healthyCount = visible.filter(
    (environment) => environment.status === 'Healthy'
  ).length;

  const setStatus = (id: string, status: EnvironmentStatus) => {
    setEnvironments((prev) =>
      prev.map((environment) =>
        environment.id === id ? { ...environment, status } : environment
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Environments</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Monitor deployment environments.
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
            {healthyCount} of {visible.length} healthy
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Environment</th>
                    <th className="px-4 py-3 font-medium">URL</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last deploy</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((environment) => (
                    <tr
                      key={environment.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {environment.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {environment.url}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(environment.status)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {environment.lastDeploy}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {environment.status === 'Warning' && (
                          <button
                            onClick={() => setStatus(environment.id, 'Healthy')}
                            className="btn btn-ghost btn-xs gap-1">
                            <FiRefreshCw />
                            Restart
                          </button>
                        )}
                        {environment.status === 'Down' && (
                          <button
                            onClick={() => setStatus(environment.id, 'Healthy')}
                            className="btn btn-ghost btn-xs gap-1">
                            <FiTool />
                            Deploy fix
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

EnvironmentsTemplate.displayName = 'EnvironmentsTemplate';
