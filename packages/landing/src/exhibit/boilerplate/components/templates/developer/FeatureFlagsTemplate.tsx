'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiFlag } from 'react-icons/fi';

type EnvKey = 'dev' | 'staging' | 'prod';

interface FeatureFlag {
  id: string;
  name: string;
  dev: boolean;
  staging: boolean;
  prod: boolean;
}

const INITIAL_FLAGS: FeatureFlag[] = [
  { id: 'f1', name: 'new-checkout', dev: true, staging: true, prod: true },
  { id: 'f2', name: 'dark-mode-2', dev: true, staging: true, prod: false },
  {
    id: 'f3',
    name: 'beta-onboarding',
    dev: true,
    staging: false,
    prod: false,
  },
  {
    id: 'f4',
    name: 'kill-switch-imports',
    dev: false,
    staging: false,
    prod: false,
  },
  { id: 'f5', name: 'instant-search', dev: true, staging: true, prod: true },
];

const ENVS: { key: EnvKey; label: string }[] = [
  { key: 'dev', label: 'Development' },
  { key: 'staging', label: 'Staging' },
  { key: 'prod', label: 'Production' },
];

export const FeatureFlagsTemplate: FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);

  const enabledCount = flags.reduce(
    (sum, flag) =>
      sum + (flag.dev ? 1 : 0) + (flag.staging ? 1 : 0) + (flag.prod ? 1 : 0),
    0
  );

  const toggleEnv = (id: string, env: EnvKey) => {
    setFlags((prev) =>
      prev.map((flag) => {
        if (flag.id !== id) return flag;
        if (env === 'dev') return { ...flag, dev: !flag.dev };
        if (env === 'staging') return { ...flag, staging: !flag.staging };
        return { ...flag, prod: !flag.prod };
      })
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Feature Flags</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Toggle features per environment.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiFlag />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Enabled</p>
              <p className="text-2xl font-bold tracking-tight">
                {enabledCount} flags enabled across environments
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Flag</th>
                    <th className="px-4 py-3 text-center font-medium">
                      Development
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Staging
                    </th>
                    <th className="px-4 py-3 text-center font-medium">
                      Production
                    </th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {flags.map((flag) => (
                    <tr
                      key={flag.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 font-mono text-sm">
                        {flag.name}
                      </td>
                      {ENVS.map((env) => (
                        <td key={env.key} className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={flag[env.key]}
                            onChange={() => toggleEnv(flag.id, env.key)}
                            aria-label={`Enable ${flag.name} in ${env.label}`}
                            className="checkbox checkbox-primary checkbox-sm"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        {flag.prod ? (
                          <span className="badge badge-success badge-sm">
                            In production
                          </span>
                        ) : (
                          <span className="badge badge-info badge-sm">
                            Staged
                          </span>
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

FeatureFlagsTemplate.displayName = 'FeatureFlagsTemplate';
