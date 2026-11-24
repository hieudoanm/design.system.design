'use client';

import type { FC } from 'react';

interface TOCItem {
  id: string;
  label: string;
  children?: TOCItem[];
}

interface TableOfContentsProps {
  items: TOCItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  title?: string;
}

export const TableOfContents: FC<TableOfContentsProps> = ({
  items,
  activeId,
  onSelect,
  title = 'On this page',
}) => (
  <nav
    aria-label={title}
    className="border-base-content/10 flex w-56 flex-col gap-1 border-l pl-4">
    <p className="text-base-content/50 text-xs font-semibold tracking-wide uppercase">
      {title}
    </p>
    <ul className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            aria-current={activeId === item.id ? 'location' : undefined}
            onClick={() => onSelect?.(item.id)}
            className={`hover:bg-base-200 w-full rounded-md px-2 py-1 text-left text-sm ${
              activeId === item.id
                ? 'text-primary font-medium'
                : 'text-base-content/60'
            }`}>
            {item.label}
          </button>
          {item.children && (
            <ul className="mt-1 flex flex-col gap-1 border-l pl-3">
              {item.children.map((child) => (
                <li key={child.id}>
                  <button
                    type="button"
                    onClick={() => onSelect?.(child.id)}
                    className={`hover:bg-base-200 w-full rounded-md px-2 py-1 text-left text-sm ${
                      activeId === child.id
                        ? 'text-primary font-medium'
                        : 'text-base-content/50'
                    }`}>
                    {child.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  </nav>
);

TableOfContents.displayName = 'TableOfContents';
