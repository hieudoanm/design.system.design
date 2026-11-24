import type { FC, ReactNode } from 'react';

interface DataListItem {
  key: string;
  label: string;
  value: ReactNode;
}

interface DataListSection {
  id: string;
  title: string;
  items: DataListItem[];
}

interface DataListProps {
  sections: DataListSection[];
}

export const DataList: FC<DataListProps> = ({ sections }) =>
  sections.length === 0 ? null : (
    <div className="flex w-full flex-col gap-4">
      {sections.map((section) => (
        <section key={section.id} aria-label={section.title}>
          <h3 className="border-base-content/10 mb-2 border-b pb-1 text-sm font-semibold">
            {section.title}
          </h3>
          <dl className="grid gap-2 sm:grid-cols-2">
            {section.items.map((item) => (
              <div key={item.key} className="bg-base-200 rounded-lg px-3 py-2">
                <dt className="text-base-content/50 text-xs">{item.label}</dt>
                <dd className="text-sm font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
