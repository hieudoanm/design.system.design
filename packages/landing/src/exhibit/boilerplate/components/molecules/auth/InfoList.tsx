import type { FC, ReactNode } from 'react';

interface InfoListItem {
  key: string;
  label: string;
  value: ReactNode;
  icon?: ReactNode;
}

interface InfoListProps {
  items: InfoListItem[];
  title?: string;
  columns?: 1 | 2;
}

export const InfoList: FC<InfoListProps> = ({ items, title, columns = 1 }) => (
  <div className="flex w-full flex-col gap-3">
    {title && <h3 className="text-sm font-semibold">{title}</h3>}
    <dl className={`grid gap-2 ${columns === 2 ? 'sm:grid-cols-2' : ''}`}>
      {items.map((item) => (
        <div
          key={item.key}
          className="border-base-content/10 bg-base-200 flex items-center gap-3 rounded-lg border px-3 py-2">
          {item.icon && (
            <span className="text-base-content/50 shrink-0">{item.icon}</span>
          )}
          <dt className="text-base-content/50 shrink-0 text-xs">
            {item.label}
          </dt>
          <dd className="min-w-0 flex-1 text-right text-sm font-medium">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  </div>
);
