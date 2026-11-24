import type { FC } from 'react';

interface PayrollEntry {
  id: string;
  name: string;
  period: string;
  gross: number;
  deductions: number;
  net: number;
  status: 'paid' | 'pending' | 'review';
}

interface PayrollOverviewProps {
  payroll: PayrollEntry[];
}

const statusClass: Record<PayrollEntry['status'], string> = {
  paid: 'badge-success',
  pending: 'badge-warning',
  review: 'badge-info',
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const PayrollOverview: FC<PayrollOverviewProps> = ({ payroll }) => {
  const totalNet = payroll.reduce((sum, entry) => sum + entry.net, 0);
  const pending = payroll.filter((entry) => entry.status === 'pending').length;

  return (
    <div className="flex w-full flex-col gap-4" data-testid="payroll-overview">
      <div className="grid grid-cols-3 gap-3">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">Net total</p>
            <p className="text-2xl font-semibold">{formatCurrency(totalNet)}</p>
          </div>
        </div>
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">Pending</p>
            <p className="text-warning text-2xl font-semibold">{pending}</p>
          </div>
        </div>
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">Payslips</p>
            <p className="text-2xl font-semibold">{payroll.length}</p>
          </div>
        </div>
      </div>
      <div className="border-base-content/10 bg-base-200 overflow-x-auto rounded-xl border">
        <table className="table-compact table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Period</th>
              <th>Gross</th>
              <th>Deductions</th>
              <th>Net</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payroll.map((entry) => (
              <tr key={entry.id}>
                <td className="font-medium">{entry.name}</td>
                <td>{entry.period}</td>
                <td>{formatCurrency(entry.gross)}</td>
                <td>-{formatCurrency(entry.deductions)}</td>
                <td className="font-medium">{formatCurrency(entry.net)}</td>
                <td>
                  <span
                    className={`badge badge-sm ${statusClass[entry.status]}`}>
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
            {payroll.length === 0 && (
              <tr>
                <td colSpan={6} className="text-base-content/40 text-center">
                  No payroll entries
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

PayrollOverview.displayName = 'PayrollOverview';
