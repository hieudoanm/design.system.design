import type { FC, ReactNode } from 'react';

interface KeyValueItem {
  key: string;
  value: ReactNode;
}

interface KeyValueProps {
  items: KeyValueItem[];
  title?: string;
}

export const KeyValue: FC<KeyValueProps> = ({ items, title }) => (
  <div className="bg-base-200 border-base-content/10 w-full rounded-xl border p-4">
    {title && <h4 className="mb-2 text-sm font-medium">{title}</h4>}
    <dl className="divide-base-content/10 divide-y">
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between py-2">
          <dt className="text-base-content/50 text-sm">{item.key}</dt>
          <dd className="text-sm font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  </div>
);
