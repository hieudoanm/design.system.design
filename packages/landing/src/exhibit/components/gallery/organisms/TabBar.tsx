'use client';

import { type FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiFolder, FiImage, FiSearch } from 'react-icons/fi';
import type { GalleryTab } from '@/exhibit/types/gallery';

interface Tab {
  key: GalleryTab;
  href: string;
  label: string;
  icon: typeof FiImage;
}

const TABS: Tab[] = [
  { key: 'photos', href: '/design-system/exhibits/gallery', label: 'Photos', icon: FiImage },
  { key: 'albums', href: '/design-system/exhibits/gallery', label: 'Albums', icon: FiFolder },
  { key: 'search', href: '/design-system/exhibits/gallery', label: 'Search', icon: FiSearch },
];

const isActive = (key: GalleryTab, pathname: string): boolean => {
  if (key === 'photos')
    return pathname === '/design-system/exhibits/gallery' || pathname === '/design-system/exhibits/gallery';
  if (key === 'albums') return pathname.startsWith('/design-system/exhibits/gallery');
  return pathname.startsWith('/design-system/exhibits/gallery');
};

export const TabBar: FC = () => {
  const pathname = usePathname();
  return (
    <nav className="border-base-300 bg-base-100/95 flex shrink-0 items-center justify-around border-t px-2 pt-1.5 pb-2 backdrop-blur">
      {TABS.map(({ key, href, label, icon: Icon }) => {
        const active = isActive(key, pathname);
        return (
          <Link
            key={key}
            href={href}
            aria-label={label}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] transition-colors ${
              active ? 'text-primary' : 'text-base-content/50'
            }`}>
            <Icon className="size-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
