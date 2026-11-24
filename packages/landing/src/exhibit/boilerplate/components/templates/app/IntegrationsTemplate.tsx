'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiCheck,
  FiCloud,
  FiCode,
  FiDatabase,
  FiSearch,
  FiSliders,
  FiZap,
} from 'react-icons/fi';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: FC<{ className?: string }>;
  connected: boolean;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Sync issues and pull requests',
    icon: FiCode,
    connected: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Post updates to your channels',
    icon: FiSliders,
    connected: false,
  },
  {
    id: 'aws',
    name: 'AWS',
    description: 'Deploy to your cloud account',
    icon: FiCloud,
    connected: false,
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Connect to your database',
    icon: FiDatabase,
    connected: false,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Handle payments and invoices',
    icon: FiZap,
    connected: true,
  },
];

const filterIntegrations = (
  integrations: Integration[],
  query: string
): Integration[] =>
  integrations.filter((integration) =>
    `${integration.name} ${integration.description}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

export const IntegrationsTemplate: FC = () => {
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [query, setQuery] = useState('');

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id
          ? { ...integration, connected: !integration.connected }
          : integration
      )
    );
  };

  const filtered = filterIntegrations(integrations, query);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Connect your favourite tools and services.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="relative mb-6 max-w-md">
          <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search integrations..."
            className="input input-bordered w-full pl-9"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-base-content/50 py-10 text-center text-sm">
            No integrations found
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((integration) => {
              const Icon = integration.icon;
              return (
                <div
                  key={integration.id}
                  className="card bg-base-200 border-base-content/10 border">
                  <div className="card-body p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                        <Icon className="h-5 w-5" />
                      </span>
                      {integration.connected && (
                        <span className="badge badge-success badge-sm">
                          <FiCheck className="h-3 w-3" />
                          Connected
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <p className="text-base-content/50 mb-4 text-sm">
                      {integration.description}
                    </p>
                    {integration.connected ? (
                      <button
                        onClick={() => toggleIntegration(integration.id)}
                        className="btn btn-error btn-sm w-full">
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleIntegration(integration.id)}
                        className="btn btn-primary btn-sm w-full">
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

IntegrationsTemplate.displayName = 'IntegrationsTemplate';
