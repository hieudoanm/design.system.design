'use client';

import { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiCreditCard, FiUser } from 'react-icons/fi';
import { navGroups } from '@/exhibit/data/wallet/nav';
import { useData } from '@/exhibit/providers/wallet/DataProvider';

const Sidebar: FC = () => {
  const pathname = usePathname();
  const { user } = useData();

  const isActive = (href: string) =>
    pathname === href || pathname === href + '/';

  return (
    <aside className="bg-base-200 border-base-300 hidden h-screen w-64 flex-col border-r md:flex">
      <div className="border-base-300 border-b p-6">
        <Link
          href="/design-system/exhibits/wallet"
          className="flex items-center gap-2 text-xl font-bold">
          <FiCreditCard /> Wallet
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4" aria-label="Sidebar">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="text-base-content/40 mb-1 px-3 text-xs font-semibold tracking-wider uppercase">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-base-content/70 hover:bg-base-300 hover:text-base-content'
                      }`}
                      aria-current={active ? 'page' : undefined}>
                      <item.icon className="text-base" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-base-300 border-t p-4">
        <div className="flex items-center gap-3">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content flex h-10 w-10 items-center justify-center rounded-full">
              <FiUser />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name ?? 'Guest'}</p>
            <p className="text-base-content/60 text-xs">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
