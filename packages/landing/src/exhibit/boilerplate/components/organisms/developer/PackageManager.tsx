'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface Package {
  id: string;
  name: string;
  version?: string;
  description?: string;
  devDependency?: boolean;
}

interface PackageManagerProps {
  packages: Package[];
  title?: string;
}

export const PackageManager: FC<PackageManagerProps> = ({
  packages,
  title = 'Package manager',
}) => {
  const [query, setQuery] = useState('');

  const filtered = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(query.toLowerCase()) ||
      (pkg.description ?? '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section className="py-4">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl">{title}</h2>
        <input
          aria-label="Search packages"
          data-testid="package-search"
          className="input input-bordered input-sm w-full max-w-xs"
          value={query}
          placeholder="Search dependencies..."
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>
      <ul className="bg-base-200 border-base-content/10 flex flex-col rounded-xl border">
        {filtered.length === 0 && (
          <li className="text-base-content/50 p-4 text-sm">
            No packages found.
          </li>
        )}
        {filtered.map((pkg) => (
          <li
            key={pkg.id}
            className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
            <div className="flex-1">
              <h3 className="font-mono text-sm font-medium">{pkg.name}</h3>
              {pkg.description && (
                <p className="text-base-content/50 text-sm">
                  {pkg.description}
                </p>
              )}
            </div>
            {pkg.devDependency && (
              <span className="badge badge-ghost badge-sm">dev</span>
            )}
            {pkg.version && (
              <span className="font-mono text-xs">{pkg.version}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
