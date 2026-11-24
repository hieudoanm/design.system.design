import Link from '@/exhibit/boilerplate/link';
import type { FC } from 'react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  brand: string;
  description?: string;
  columns: FooterColumn[];
  copyright?: string;
}

export const Footer: FC<FooterProps> = ({
  brand,
  description,
  columns,
  copyright,
}) => (
  <footer className="bg-base-200 border-base-300 border-t px-8 py-10">
    <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-2">
        <span className="text-lg font-medium">{brand}</span>
        {description && (
          <p className="text-base-content/50 text-sm">{description}</p>
        )}
      </div>
      {columns.map((column) => (
        <nav
          key={column.title}
          aria-label={column.title}
          className="flex flex-col gap-2">
          <span className="font-medium">{column.title}</span>
          {column.links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-base-content/60 hover:text-primary text-sm">
              {link.label}
            </Link>
          ))}
        </nav>
      ))}
    </div>
    {copyright && (
      <div className="border-base-300 text-base-content/50 mx-auto mt-8 max-w-5xl border-t pt-6 text-sm">
        {copyright}
      </div>
    )}
  </footer>
);
