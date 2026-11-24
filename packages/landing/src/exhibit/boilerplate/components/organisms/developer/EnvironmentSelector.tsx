import type { FC } from 'react';

interface Environment {
  id: string;
  name: string;
  url?: string;
  status?: 'online' | 'offline';
}

interface EnvironmentSelectorProps {
  environments: Environment[];
  selected?: string;
  title?: string;
}

const statusClass: Record<string, string> = {
  online: 'badge-success',
  offline: 'badge-error',
};

export const EnvironmentSelector: FC<EnvironmentSelectorProps> = ({
  environments,
  selected,
  title = 'Environment',
}) => (
  <section className="py-4">
    <h2 className="mb-3 text-xl">{title}</h2>
    <div className="bg-base-200 border-base-content/10 flex flex-col gap-2 rounded-xl border p-3">
      <label className="flex flex-col gap-1">
        Active environment
        <select
          aria-label="Environment"
          className="select select-bordered select-sm"
          defaultValue={selected ?? environments[0]?.id}
          data-testid="environment-select">
          {environments.map((environment) => (
            <option key={environment.id} value={environment.id}>
              {environment.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {environments.map((environment) => (
          <div
            key={environment.id}
            className="bg-base-100 border-base-content/10 flex items-center justify-between rounded-xl border p-3">
            <div>
              <h3 className="text-sm font-medium">{environment.name}</h3>
              {environment.url && (
                <p className="text-base-content/40 text-xs">
                  {environment.url}
                </p>
              )}
            </div>
            {environment.status && (
              <span
                className={`badge badge-sm ${
                  statusClass[environment.status] ?? 'badge-ghost'
                }`}>
                {environment.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);
