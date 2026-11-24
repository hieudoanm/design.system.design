import type { FC, ReactNode } from 'react';

interface Logo {
  name: string;
  icon?: ReactNode;
}

interface LogosSectionProps {
  items: Logo[];
  title?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
}

const gridClass: Record<NonNullable<LogosSectionProps['columns']>, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-5',
  6: 'grid-cols-3 sm:grid-cols-6',
};

export const LogosSection: FC<LogosSectionProps> = ({
  items,
  title = 'Trusted by teams',
  columns = 6,
}) => (
  <section className="py-10">
    <h2 className="text-base-content/50 mb-6 text-center text-sm font-medium tracking-wide uppercase">
      {title}
    </h2>
    <div className={`grid gap-4 ${gridClass[columns]}`}>
      {items.map((item) => (
        <div
          key={item.name}
          className="text-base-content/50 border-base-content/10 flex items-center justify-center gap-2 rounded-xl border p-4 text-sm">
          {item.icon}
          <span className="font-medium">{item.name}</span>
        </div>
      ))}
    </div>
  </section>
);
