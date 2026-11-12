'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FC } from 'react';
import { businessNavGroups } from '@/exhibit/data/tax/nav';

export const Sidebar: FC = () => {
  const pathname = usePathname();

  return (
    <aside className="bg-base-200 border-base-300 hidden h-screen w-64 flex-col border-r md:flex">
      <div className="border-base-300 flex items-center gap-2 border-b px-6 py-4">
        <Link href="/design-system/exhibits" className="text-xl font-bold">
          🏢 Business
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {businessNavGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <h3 className="text-base-content/50 mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
              {group.label}
            </h3>
            <ul className="list-none space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/design-system/exhibits/tax' && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-base-content/70 hover:bg-base-300 hover:text-base-content'
                      }`}>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};
