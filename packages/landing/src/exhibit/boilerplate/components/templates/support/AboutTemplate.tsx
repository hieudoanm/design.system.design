import type { FC } from 'react';
import { PageShell } from '@/exhibit/boilerplate/components/templates/shared/PageShell';
import { FiHome, FiSettings, FiInfo, FiClock } from 'react-icons/fi';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: <FiHome /> },
  { label: 'About', href: '/shared/about', icon: <FiInfo /> },
  { label: 'Settings', href: '/app/settings', icon: <FiSettings /> },
  { label: 'Version', href: '/app/version', icon: <FiClock /> },
];

interface InfoRow {
  label: string;
  value: string;
}

export const AboutTemplate: FC<{
  name: string;
  description: string;
  version: string;
  items: InfoRow[];
}> = ({ name, description, version, items }) => (
  <PageShell title="About" navItems={NAV_ITEMS}>
    <p className="text-base-content/50 text-xs tracking-[0.2em] uppercase">
      About
    </p>

    <h1>{name}</h1>

    <p className="text-base-content/50 max-w-sm text-center text-sm">
      {description}
    </p>

    <div className="border-base-content/10 bg-base-200 mb-8 w-full max-w-lg rounded-2xl border p-6">
      <div className="flex flex-col gap-4">
        {items.map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-base-content/50 text-sm">{label}</span>
            <span className="text-base-content font-mono text-sm font-bold">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className="flex flex-wrap justify-center gap-3">
      <span className="border-base-content/20 text-base-content/50 rounded-full border px-3 py-1 text-xs">
        {version}
      </span>
      <span className="badge badge-neutral rounded-full">Stable</span>
    </div>
  </PageShell>
);

AboutTemplate.displayName = 'AboutTemplate';
