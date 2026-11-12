import { formatMoney } from './money';
import type { ReportPeriod, Transaction } from '@/exhibit/types/pos';

const CSV_HEADER = 'Date,ID,Subtotal,Tax,Total,Payment,Status';

export const buildSalesReportCsv = (transactions: Transaction[]): string => {
  const rows = transactions.map(
    (t) =>
      `${t.createdAt},${t.id.slice(0, 8)},${t.subtotal.toFixed(2)},${t.tax.toFixed(
        2
      )},${t.total.toFixed(2)},${t.payments.map((p) => p.method).join('+')},${
        t.status
      }`
  );
  return [CSV_HEADER, ...rows].join('\n');
};

export const getSalesReportFilename = (
  period: ReportPeriod,
  today: string
): string => `sales-report-${period}-${today}.csv`;

export const buildReceiptText = (transaction: Transaction): string =>
  [
    '=== RECEIPT ===',
    `ID: ${transaction.id.slice(0, 8)}`,
    `Date: ${new Date(transaction.createdAt).toLocaleString()}`,
    '',
    ...transaction.items.map(
      (ci) =>
        `${ci.item.name} x${ci.quantity}  ${formatMoney(
          ci.item.price * ci.quantity
        )}`
    ),
    '',
    `Subtotal: ${formatMoney(transaction.subtotal)}`,
    `Tax: ${formatMoney(transaction.tax)}`,
    `Total: ${formatMoney(transaction.total)}`,
    '',
    ...transaction.payments.map(
      (p) => `${p.method.toUpperCase()}: ${formatMoney(p.amount)}`
    ),
    '',
    'Thank you!',
  ].join('\n');
