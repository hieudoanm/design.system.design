'use client';

import type { FC, ReactNode } from 'react';

interface AppShellNavItem {
  label: string;
  active?: boolean;
  badge?: number;
}

interface AppShellProps {
  title: string;
  navItems: AppShellNavItem[];
  onNavigate?: (label: string) => void;
  user?: { name: string; initials: string };
  children: ReactNode;
}

export const AppShell: FC<AppShellProps> = ({
  title,
  navItems,
  onNavigate,
  user,
  children,
}) => (
  <div data-testid="app-shell" className="bg-base-200 flex min-h-screen">
    <aside className="bg-base-100 border-base-200 sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r">
      <div className="border-base-200 flex h-16 items-center gap-2 border-b px-4">
        <span className="bg-primary text-primary-content inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold">
          {title.slice(0, 1).toUpperCase()}
        </span>
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                data-testid={`nav-${item.label}`}
                onClick={() => onNavigate?.(item.label)}
                className={`btn btn-ghost w-full justify-start ${
                  item.active
                    ? 'bg-primary text-primary-content hover:bg-primary hover:text-primary-content'
                    : ''
                }`}>
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="badge badge-sm ml-auto">{item.badge}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {user && (
        <div className="border-base-200 flex items-center gap-3 border-t p-4">
          <div className="avatar placeholder">
            <div className="bg-neutral text-neutral-content w-9 rounded-full">
              <span>{user.initials}</span>
            </div>
          </div>
          <span className="text-sm font-medium">{user.name}</span>
        </div>
      )}
    </aside>
    <main className="flex-1 p-6">{children}</main>
  </div>
);
