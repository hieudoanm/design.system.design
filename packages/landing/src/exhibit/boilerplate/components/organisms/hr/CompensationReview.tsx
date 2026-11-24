import type { FC } from 'react';

interface CompensationRecord {
  id: string;
  name: string;
  role: string;
  base: number;
  bonus: number;
  change: number;
  status: 'approved' | 'pending';
}

interface CompensationReviewProps {
  records: CompensationRecord[];
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const CompensationReview: FC<CompensationReviewProps> = ({
  records,
}) => (
  <div className="flex w-full flex-col gap-4" data-testid="compensation-review">
    <div className="border-base-content/10 bg-base-200 overflow-x-auto rounded-xl border">
      <table className="table-compact table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Base</th>
            <th>Bonus</th>
            <th>Total</th>
            <th>Change</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td className="font-medium">{record.name}</td>
              <td>{record.role}</td>
              <td>{formatCurrency(record.base)}</td>
              <td>{formatCurrency(record.bonus)}</td>
              <td className="font-medium">
                {formatCurrency(record.base + record.bonus)}
              </td>
              <td>
                <span
                  className={`badge badge-sm ${
                    record.change >= 0 ? 'badge-success' : 'badge-error'
                  }`}>
                  {record.change >= 0 ? '+' : ''}
                  {record.change}%
                </span>
              </td>
              <td>
                <span
                  className={`badge badge-sm ${
                    record.status === 'approved'
                      ? 'badge-success'
                      : 'badge-warning'
                  }`}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
          {records.length === 0 && (
            <tr>
              <td colSpan={7} className="text-base-content/40 text-center">
                No compensation records
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

CompensationReview.displayName = 'CompensationReview';
