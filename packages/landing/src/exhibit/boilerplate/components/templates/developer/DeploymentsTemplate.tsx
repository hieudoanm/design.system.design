'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

type DeploymentStatus = 'Success' | 'Running' | 'Failed';
type DeploymentFilter = 'All' | DeploymentStatus;

interface Deployment {
  id: string;
  env: string;
  version: string;
  author: string;
  time: string;
  status: DeploymentStatus;
}

const DEPLOYMENTS: Deployment[] = [
  {
    id: 'deploy-1042',
    env: 'Production',
    version: 'v2.4.1',
    author: 'Maya',
    time: 'Aug 7, 09:12',
    status: 'Success',
  },
  {
    id: 'deploy-1041',
    env: 'Staging',
    version: 'v2.4.1',
    author: 'Leo',
    time: 'Aug 7, 08:47',
    status: 'Success',
  },
  {
    id: 'deploy-1040',
    env: 'Production',
    version: 'v2.4.0',
    author: 'Nia',
    time: 'Aug 6, 18:30',
    status: 'Running',
  },
  {
    id: 'deploy-1039',
    env: 'Staging',
    version: 'v2.4.0',
    author: 'Omar',
    time: 'Aug 6, 15:02',
    status: 'Failed',
  },
  {
    id: 'deploy-1038',
    env: 'Development',
    version: 'v2.3.9',
    author: 'Ava',
    time: 'Aug 5, 11:20',
    status: 'Success',
  },
  {
    id: 'deploy-1037',
    env: 'Staging',
    version: 'v2.3.9',
    author: 'Ken',
    time: 'Aug 5, 09:55',
    status: 'Running',
  },
];

const FILTERS: DeploymentFilter[] = ['All', 'Success', 'Running', 'Failed'];

const getStatusBadge = (status: DeploymentStatus) => {
  switch (status) {
    case 'Running':
      return <span className="badge badge-info badge-sm">Running</span>;
    case 'Failed':
      return <span className="badge badge-error badge-sm">Failed</span>;
    default:
      return <span className="badge badge-success badge-sm">Success</span>;
  }
};

export const DeploymentsTemplate: FC = () => {
  const [deployments, setDeployments] = useState<Deployment[]>(DEPLOYMENTS);
  const [filter, setFilter] = useState<DeploymentFilter>('All');

  const visible = deployments.filter(
    (deployment) => filter === 'All' || deployment.status === filter
  );

  const rollback = (id: string) => {
    setDeployments((prev) =>
      prev.map((deployment) =>
        deployment.id === id ? { ...deployment, status: 'Running' } : deployment
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Deployments</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Review deployment history.
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
            {visible.length} deployments
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Deploy</th>
                    <th className="px-4 py-3 font-medium">Environment</th>
                    <th className="px-4 py-3 font-medium">Version</th>
                    <th className="px-4 py-3 font-medium">Author</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((deployment) => (
                    <tr
                      key={deployment.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 font-mono text-sm">
                        {deployment.id}
                      </td>
                      <td className="px-4 py-3 text-sm">{deployment.env}</td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {deployment.version}
                      </td>
                      <td className="px-4 py-3 text-sm">{deployment.author}</td>
                      <td className="px-4 py-3 text-sm">{deployment.time}</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(deployment.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {deployment.status === 'Success' && (
                          <button
                            onClick={() => rollback(deployment.id)}
                            className="btn btn-ghost btn-xs gap-1">
                            <FiRefreshCw />
                            Rollback
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

DeploymentsTemplate.displayName = 'DeploymentsTemplate';
