'use client';

import { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { bottomNavItems } from '@/exhibit/data/wallet/nav';

const BottomNav: FC = () => {
  const pathname = usePathname();

  return (
    <nav
      className="bg-base-200 border-base-300 fixed right-0 bottom-0 left-0 border-t md:hidden"
      aria-label="Bottom navigation">
      <ul className="mx-auto flex w-full max-w-lg justify-around py-1">
        {bottomNavItems.map((item) => {
          const isActive =
            pathname === item.href || pathname === item.href + '/';
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-base-content/60 hover:bg-base-300'
                }`}
                aria-current={isActive ? 'page' : undefined}>
                <item.icon className="text-lg" />
                <span className="text-[10px] leading-tight font-medium">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
