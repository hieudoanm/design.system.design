import type { FC, ReactNode } from 'react';

interface ListItem {
  id: string;
  title: string;
  description?: string;
  leading?: ReactNode;
  action?: ReactNode;
}

interface ListProps {
  items: ListItem[];
  title?: string;
}

export const List: FC<ListProps> = ({ items, title }) => (
  <div className="bg-base-200 border-base-content/10 w-full rounded-xl border p-2">
    {title && <div className="px-2 py-2 text-sm font-medium">{title}</div>}
    <ul className="list">
      {items.map((item) => (
        <li key={item.id} className="list-row gap-4">
          {item.leading && <div className="shrink-0">{item.leading}</div>}
          <div className="min-w-0">
            <div className="truncate">{item.title}</div>
            {item.description && (
              <div className="text-base-content/50 truncate text-xs">
                {item.description}
              </div>
            )}
          </div>
          {item.action && <div className="ml-auto shrink-0">{item.action}</div>}
        </li>
      ))}
    </ul>
  </div>
);
