import type { FC } from 'react';

interface TaxSummaryProps {
  grossIncome: number;
  deductions: number;
  credits: number;
  taxPaid: number;
  currency?: string;
  title?: string;
}

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const TaxSummary: FC<TaxSummaryProps> = ({
  grossIncome,
  deductions,
  credits,
  taxPaid,
  currency = 'USD',
  title = 'Tax summary',
}) => {
  const taxableIncome = Math.max(grossIncome - deductions, 0);
  const estimatedTax = Math.max(taxableIncome * 0.22 - credits, 0);
  const refund = taxPaid - estimatedTax;

  return (
    <section className="card bg-base-200 w-full">
      <div className="card-body flex flex-col gap-4">
        <h3 className="card-title">{title}</h3>
        <dl className="grid grid-cols-2 gap-3">
          <div className="bg-base-100 rounded-xl p-4">
            <dt className="text-base-content/50 text-xs">Gross income</dt>
            <dd className="text-lg">{formatAmount(grossIncome, currency)}</dd>
          </div>
          <div className="bg-base-100 rounded-xl p-4">
            <dt className="text-base-content/50 text-xs">Deductions</dt>
            <dd className="text-lg">{formatAmount(deductions, currency)}</dd>
          </div>
          <div className="bg-base-100 rounded-xl p-4">
            <dt className="text-base-content/50 text-xs">Estimated tax</dt>
            <dd className="text-lg">{formatAmount(estimatedTax, currency)}</dd>
          </div>
          <div className="bg-base-100 rounded-xl p-4">
            <dt className="text-base-content/50 text-xs">Tax paid</dt>
            <dd className="text-lg">{formatAmount(taxPaid, currency)}</dd>
          </div>
        </dl>
        <div
          className={`rounded-xl p-4 ${
            refund >= 0
              ? 'bg-success/10 text-success'
              : 'bg-error/10 text-error'
          }`}>
          <p className="text-sm font-medium" data-testid="result">
            {refund >= 0 ? 'Estimated refund' : 'Amount due'}:{' '}
            {formatAmount(Math.abs(refund), currency)}
          </p>
        </div>
      </div>
    </section>
  );
};
