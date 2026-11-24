'use client';

import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { FiEye, FiEyeOff, FiPlus, FiTrash2 } from 'react-icons/fi';

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
  active: boolean;
}

const INITIAL_KEYS: ApiKey[] = [
  {
    id: 'k1',
    name: 'Production',
    prefix: 'pk_live_9f2a',
    created: 'Aug 7, 2026',
    lastUsed: 'Aug 6, 2026',
    active: true,
  },
  {
    id: 'k2',
    name: 'Staging',
    prefix: 'sk_live_81cd',
    created: 'Jul 21, 2026',
    lastUsed: 'Aug 5, 2026',
    active: true,
  },
  {
    id: 'k3',
    name: 'Sandbox',
    prefix: 'pk_test_5b3e',
    created: 'Jun 12, 2026',
    lastUsed: 'Jul 30, 2026',
    active: true,
  },
  {
    id: 'k4',
    name: 'Read-only',
    prefix: 'rk_live_4a77',
    created: 'May 3, 2026',
    lastUsed: 'Never',
    active: false,
  },
];

export const ApiKeysTemplate: FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [revealedId, setRevealedId] = useState<string | null>(null);

  const activeCount = keys.filter((apiKey) => apiKey.active).length;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage('Enter a key name');
      return;
    }
    setKeys((prev) => [
      ...prev,
      {
        id: `key${Date.now()}`,
        name: trimmedName,
        prefix: 'pk_new_8a3f',
        created: 'Aug 7, 2026',
        lastUsed: 'Never',
        active: true,
      },
    ]);
    setName('');
    setMessage('Key created');
  };

  const revokeKey = (id: string) => {
    setKeys((prev) =>
      prev.map((apiKey) =>
        apiKey.id === id ? { ...apiKey, active: false } : apiKey
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Create and manage access keys.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body p-5">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-3 sm:flex-row">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CI pipeline"
                aria-label="Key name"
                className="input input-bordered input-sm sm:flex-1"
              />
              <button type="submit" className="btn btn-primary btn-sm gap-1">
                <FiPlus />
                Create key
              </button>
            </form>
            {message === 'Enter a key name' && (
              <p className="text-error text-sm" role="alert">
                Enter a key name
              </p>
            )}
            {message === 'Key created' && (
              <p className="text-success text-sm">Key created</p>
            )}
          </div>
        </div>

        <p className="text-base-content/50 mb-4 text-sm">
          {activeCount} active keys
        </p>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Key</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Last used</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((apiKey) => (
                    <tr
                      key={apiKey.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {apiKey.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {revealedId === apiKey.id
                          ? 'sk_live_XXXXXXXXXXXX'
                          : `${apiKey.prefix}...`}
                      </td>
                      <td className="px-4 py-3 text-sm">{apiKey.created}</td>
                      <td className="px-4 py-3 text-sm">{apiKey.lastUsed}</td>
                      <td className="px-4 py-3">
                        {apiKey.active ? (
                          <span className="badge badge-success badge-sm">
                            Active
                          </span>
                        ) : (
                          <span className="badge badge-error badge-sm">
                            Revoked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {apiKey.active && (
                          <>
                            <button
                              onClick={() =>
                                setRevealedId(
                                  revealedId === apiKey.id ? null : apiKey.id
                                )
                              }
                              className="btn btn-ghost btn-xs gap-1">
                              {revealedId === apiKey.id ? (
                                <FiEyeOff />
                              ) : (
                                <FiEye />
                              )}
                              {revealedId === apiKey.id ? 'Hide' : 'Reveal'}
                            </button>
                            <button
                              onClick={() => revokeKey(apiKey.id)}
                              className="btn btn-ghost btn-xs gap-1">
                              <FiTrash2 />
                              Revoke
                            </button>
                          </>
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

ApiKeysTemplate.displayName = 'ApiKeysTemplate';
