import Link from '@/exhibit/boilerplate/link';
import type { FC } from 'react';

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

export const Breadcrumbs: FC<BreadcrumbsProps> = ({ items }) => (
  <nav aria-label="Breadcrumb">
    <div className="breadcrumbs text-sm">
      <ul>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          if (!item.href || isLast) {
            return (
              <li key={item.label} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </li>
            );
          }
          return (
            <li key={item.label}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  </nav>
);
