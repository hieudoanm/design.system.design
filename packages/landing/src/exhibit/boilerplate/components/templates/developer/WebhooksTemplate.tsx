'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiSend, FiZap } from 'react-icons/fi';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
}

const INITIAL_WEBHOOKS: Webhook[] = [
  {
    id: 'w1',
    name: 'Deployments',
    url: 'https://hooks.example.com/deployments',
    events: ['deploy.success', 'deploy.failed'],
    enabled: true,
  },
  {
    id: 'w2',
    name: 'Billing',
    url: 'https://hooks.example.com/billing',
    events: ['invoice.paid', 'invoice.failed'],
    enabled: true,
  },
  {
    id: 'w3',
    name: 'Members',
    url: 'https://hooks.example.com/members',
    events: ['member.joined', 'member.left'],
    enabled: false,
  },
];

export const WebhooksTemplate: FC = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_WEBHOOKS);
  const [testedId, setTestedId] = useState<string | null>(null);

  const toggleWebhook = (id: string) => {
    setWebhooks((prev) =>
      prev.map((webhook) =>
        webhook.id === id ? { ...webhook, enabled: !webhook.enabled } : webhook
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Deliver events to your own endpoints in real time.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Endpoint</th>
                    <th className="px-4 py-3 font-medium">Events</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks.map((webhook) => (
                    <tr
                      key={webhook.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <FiZap className="text-base-content/50 h-4 w-4" />
                          {webhook.name}
                        </p>
                        <p className="text-base-content/40 mt-0.5 font-mono text-xs">
                          {webhook.url}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <span
                              key={event}
                              className="badge badge-ghost badge-sm font-mono">
                              {event}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {webhook.enabled ? (
                          <span className="badge badge-success badge-sm">
                            Active
                          </span>
                        ) : (
                          <span className="badge badge-neutral badge-sm">
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {testedId === webhook.id && (
                            <span className="text-success text-xs font-medium">
                              Test sent
                            </span>
                          )}
                          <button
                            onClick={() => setTestedId(webhook.id)}
                            className="btn btn-ghost btn-xs">
                            <FiSend />
                            Test
                          </button>
                          <input
                            type="checkbox"
                            checked={webhook.enabled}
                            onChange={() => toggleWebhook(webhook.id)}
                            aria-label={`Toggle ${webhook.name}`}
                            className="toggle toggle-primary toggle-sm"
                          />
                        </div>
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

WebhooksTemplate.displayName = 'WebhooksTemplate';
