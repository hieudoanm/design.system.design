'use client';

import Link from '@/exhibit/boilerplate/link';
import { useBoilerplatePathname } from '@/exhibit/boilerplate/nav';
import type { FC, ReactNode } from 'react';

interface SidebarItem {
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string;
}

interface SidebarProps {
  title: string;
  items: SidebarItem[];
  footer?: ReactNode;
}

const isActive = (href: string, pathname: string): boolean =>
  href === '/' ? pathname === '/' : pathname.startsWith(href);

export const Sidebar: FC<SidebarProps> = ({ title, items, footer }) => {
  const pathname = useBoilerplatePathname();

  return (
    <aside className="border-base-300 bg-base-200 flex h-full w-64 shrink-0 flex-col border-r">
      <div className="border-base-300 border-b p-4">
        <h2 className="text-lg">{title}</h2>
      </div>
      <ul className="menu flex-1 gap-1 p-3">
        {items.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'bg-primary text-primary-content'
                    : 'hover:bg-base-300'
                }>
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="badge badge-sm">{item.badge}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
      {footer && <div className="border-base-300 border-t p-4">{footer}</div>}
    </aside>
  );
};
