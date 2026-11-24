import type { FC } from 'react';

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
}

interface CustomerTableProps {
  rows: CustomerRow[];
}

export const CustomerTable: FC<CustomerTableProps> = ({ rows }) => (
  <div data-testid="customer-table" className="overflow-x-auto">
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Plan</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={4} className="text-base-content/40 text-center">
              No customers
            </td>
          </tr>
        )}
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="font-medium">{row.name}</td>
            <td>{row.email}</td>
            <td>{row.plan}</td>
            <td>
              <span className="badge badge-ghost badge-sm">{row.status}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

CustomerTable.displayName = 'CustomerTable';
