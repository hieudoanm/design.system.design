import type { FC, ReactNode } from 'react';

type DataRow = Record<string, unknown>;

interface DataColumn {
  key: string;
  header: string;
  render?: (row: DataRow) => ReactNode;
}

interface DataTableProps {
  columns: DataColumn[];
  rows: DataRow[];
  emptyText?: string;
}

export const DataTable: FC<DataTableProps> = ({
  columns,
  rows,
  emptyText = 'No records found.',
}) => (
  <div className="overflow-x-auto">
    <table className="table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column) => (
              <td key={column.key}>
                {column.render
                  ? column.render(row)
                  : String(row[column.key] ?? '')}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    {rows.length === 0 && (
      <div className="text-base-content/50 py-6 text-center text-sm">
        {emptyText}
      </div>
    )}
  </div>
);
