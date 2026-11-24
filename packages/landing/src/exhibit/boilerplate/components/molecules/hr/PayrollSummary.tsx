import type { FC } from 'react';

interface PayrollSummaryProps {
  period: string;
  gross: number;
  net: number;
  deductions?: number;
  bonus?: number;
  taxes?: number;
  currency?: string;
  className?: string;
}

const formatCurrency = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value);

export const PayrollSummary: FC<PayrollSummaryProps> = ({
  period,
  gross,
  net,
  deductions = 0,
  bonus = 0,
  taxes = 0,
  currency = 'USD',
  className = '',
}) => {
  return (
    <div
      data-testid="payroll-summary"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium">Payroll</h3>
        <span className="text-base-content/50 text-xs">{period}</span>
      </div>
      <dl className="mt-3 flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-base-content/50">Gross</dt>
          <dd>{formatCurrency(gross, currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-base-content/50">Bonus</dt>
          <dd>{formatCurrency(bonus, currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-base-content/50">Taxes</dt>
          <dd>-{formatCurrency(taxes, currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-base-content/50">Deductions</dt>
          <dd>-{formatCurrency(deductions, currency)}</dd>
        </div>
        <div className="border-base-content/10 mt-2 flex justify-between border-t pt-2">
          <dt className="font-medium">Net pay</dt>
          <dd className="text-success font-semibold">
            {formatCurrency(net, currency)}
          </dd>
        </div>
      </dl>
    </div>
  );
};
