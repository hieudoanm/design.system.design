'use client';

import type { FC } from 'react';
import { useState } from 'react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type MethodFilter = 'All' | HttpMethod;

interface Endpoint {
  id: string;
  method: HttpMethod;
  path: string;
  latency: number;
  status: number;
}

const ENDPOINTS: Endpoint[] = [
  { id: 'e1', method: 'GET', path: '/api/users', latency: 120, status: 200 },
  { id: 'e2', method: 'POST', path: '/api/users', latency: 210, status: 201 },
  { id: 'e3', method: 'GET', path: '/api/orders', latency: 95, status: 200 },
  {
    id: 'e4',
    method: 'PUT',
    path: '/api/orders/{id}',
    latency: 160,
    status: 200,
  },
  {
    id: 'e5',
    method: 'DELETE',
    path: '/api/users/{id}',
    latency: 80,
    status: 400,
  },
  { id: 'e6', method: 'GET', path: '/api/health', latency: 12, status: 200 },
  {
    id: 'e7',
    method: 'POST',
    path: '/api/webhooks',
    latency: 340,
    status: 500,
  },
  { id: 'e8', method: 'GET', path: '/api/metrics', latency: 45, status: 200 },
];

const FILTERS: MethodFilter[] = ['All', 'GET', 'POST', 'PUT', 'DELETE'];

const getMethodBadge = (method: HttpMethod) => {
  switch (method) {
    case 'POST':
      return <span className="badge badge-info badge-sm">POST</span>;
    case 'PUT':
      return <span className="badge badge-warning badge-sm">PUT</span>;
    case 'DELETE':
      return <span className="badge badge-error badge-sm">DELETE</span>;
    default:
      return <span className="badge badge-success badge-sm">GET</span>;
  }
};

const getStatusBadge = (status: number) => {
  if (status >= 500) {
    return <span className="badge badge-error badge-sm">{status}</span>;
  }
  if (status >= 400) {
    return <span className="badge badge-warning badge-sm">{status}</span>;
  }
  return <span className="badge badge-success badge-sm">{status}</span>;
};

export const EndpointsTemplate: FC = () => {
  const [filter, setFilter] = useState<MethodFilter>('All');

  const visible = ENDPOINTS.filter(
    (endpoint) => filter === 'All' || endpoint.method === filter
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Endpoints</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Explore the public API surface.
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
            {visible.length} endpoints
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Path</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Latency
                    </th>
                    <th className="px-4 py-3 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((endpoint) => (
                    <tr
                      key={endpoint.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3">
                        {getMethodBadge(endpoint.method)}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {endpoint.path}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {endpoint.latency}ms
                      </td>
                      <td className="px-4 py-3 text-right">
                        {getStatusBadge(endpoint.status)}
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

EndpointsTemplate.displayName = 'EndpointsTemplate';
