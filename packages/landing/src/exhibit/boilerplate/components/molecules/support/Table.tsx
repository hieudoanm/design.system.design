import type { FC } from 'react';

interface Column {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
}

interface TableProps {
  columns: Column[];
  rows: Record<string, string | number | boolean | null | undefined>[];
  caption?: string;
  striped?: boolean;
  compact?: boolean;
}

const alignClass: Record<NonNullable<Column['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const Table: FC<TableProps> = ({
  columns,
  rows,
  caption,
  striped = false,
  compact = false,
}) => (
  <div className="overflow-x-auto">
    <table
      className={`table ${striped ? 'table-zebra' : ''} ${compact ? 'table-compact' : ''}`}>
      {caption && (
        <caption className="text-base-content/60 text-sm">{caption}</caption>
      )}
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} className={alignClass[column.align ?? 'left']}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column) => (
              <td
                key={column.key}
                className={alignClass[column.align ?? 'left']}>
                {row[column.key] ?? '\u2014'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
