import type { FC, ReactNode } from 'react';

interface ComparisonRow {
  label: string;
  values: ReactNode[];
}

interface ComparisonColumn {
  title: string;
  featured?: boolean;
}

interface ComparisonSectionProps {
  title?: string;
  description?: string;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  className?: string;
}

export const ComparisonSection: FC<ComparisonSectionProps> = ({
  title,
  description,
  columns,
  rows,
  className = '',
}) => (
  <section className={`flex w-full flex-col gap-4 ${className}`}>
    {(title || description) && (
      <div className="flex flex-col gap-1">
        {title && <h2 className="text-xl font-semibold">{title}</h2>}
        {description && (
          <p className="text-base-content/60 text-sm">{description}</p>
        )}
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-sm">
            <th className="text-base-content/60">Feature</th>
            {columns.map((column) => (
              <th
                key={column.title}
                className={
                  column.featured
                    ? 'bg-primary/10 text-primary text-center'
                    : 'text-center'
                }>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th className="text-base-content/70 text-left">{row.label}</th>
              {row.values.map((value, index) => (
                <td
                  key={index}
                  className={
                    columns[index]?.featured
                      ? 'bg-primary/5 text-center'
                      : 'text-center'
                  }>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

ComparisonSection.displayName = 'ComparisonSection';
