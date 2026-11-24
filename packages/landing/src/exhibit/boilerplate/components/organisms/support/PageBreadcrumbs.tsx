import Link from '@/exhibit/boilerplate/link';
import type { FC, ReactNode } from 'react';

interface PageBreadcrumbsCrumb {
  label: string;
  href?: string;
}

interface PageBreadcrumbsProps {
  items: PageBreadcrumbsCrumb[];
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const PageBreadcrumbs: FC<PageBreadcrumbsProps> = ({
  items,
  title,
  description,
  actions,
}) => (
  <div className="flex w-full flex-col gap-3">
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
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">{title}</h1>
        {description && (
          <p className="text-base-content/60 text-sm">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  </div>
);
