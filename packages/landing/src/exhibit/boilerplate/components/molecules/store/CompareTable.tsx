import type { FC } from 'react';

interface CompareColumn {
  label: string;
  values: Array<string | number>;
}

interface CompareTableProps {
  products: string[];
  rows: CompareColumn[];
}

export const CompareTable: FC<CompareTableProps> = ({ products, rows }) => (
  <div className="overflow-x-auto" data-testid="compare-table">
    <table className="table-zebra table">
      <thead>
        <tr>
          <th>Feature</th>
          {products.map((product) => (
            <th key={product}>{product}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th>{row.label}</th>
            {row.values.map((value, index) => (
              <td key={`${row.label}-${index}`}>{value}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
