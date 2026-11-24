'use client';

import type { FC } from 'react';
import { useState } from 'react';

type ServiceStatus = 'Operational' | 'Degraded' | 'Outage';
type StatusFilter = 'All' | ServiceStatus;

interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
}

const SERVICES: Service[] = [
  { id: 's1', name: 'API', status: 'Operational' },
  { id: 's2', name: 'Web app', status: 'Operational' },
  { id: 's3', name: 'Payments', status: 'Degraded' },
  { id: 's4', name: 'Email delivery', status: 'Operational' },
  { id: 's5', name: 'Dashboard', status: 'Outage' },
];

const FILTERS: StatusFilter[] = ['All', 'Operational', 'Degraded', 'Outage'];

const getStatusBadge = (status: ServiceStatus) => {
  switch (status) {
    case 'Degraded':
      return <span className="badge badge-warning badge-sm">Degraded</span>;
    case 'Outage':
      return <span className="badge badge-error badge-sm">Outage</span>;
    default:
      return <span className="badge badge-success badge-sm">Operational</span>;
  }
};

export const ServiceStatusTemplate: FC = () => {
  const [filter, setFilter] = useState<StatusFilter>('All');

  const visible = SERVICES.filter(
    (service) => filter === 'All' || service.status === filter
  );
  const operationalCount = SERVICES.filter(
    (service) => service.status === 'Operational'
  ).length;

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Service Status</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Check the health of our services.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
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
            {operationalCount} of {SERVICES.length} services operational
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Service</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((service) => (
                    <tr
                      key={service.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {service.name}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(service.status)}
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

ServiceStatusTemplate.displayName = 'ServiceStatusTemplate';
