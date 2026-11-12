import type { Transaction } from '@/exhibit/types/wallet';
import { formatCurrency, formatDate } from './format';

export const exportTransactionsCSV = (transactions: Transaction[]): void => {
  console.log('[export] exportTransactionsCSV', transactions.length);

  const headers = ['Date', 'Title', 'Category', 'Type', 'Amount', 'Currency'];
  const rows = transactions.map((tx) => [
    formatDate(tx.date),
    tx.title,
    tx.category,
    tx.type,
    String(Math.abs(tx.amount)),
    tx.currency,
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `transactions-${toDateString(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportTransactionsPDF = (transactions: Transaction[]): void => {
  console.log('[export] exportTransactionsPDF', transactions.length);

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .subtitle { color: #666; margin-bottom: 24px; }
        .summary { display: flex; gap: 24px; margin-bottom: 24px; }
        .summary-card { padding: 16px; background: #f5f5f5; border-radius: 8px; flex: 1; }
        .summary-label { font-size: 12px; color: #666; text-transform: uppercase; }
        .summary-value { font-size: 20px; font-weight: bold; }
        .income { color: #16a34a; }
        .expense { color: #dc2626; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        th { text-align: left; padding: 8px; border-bottom: 2px solid #e5e5e5; font-size: 12px; text-transform: uppercase; color: #666; }
        td { padding: 8px; border-bottom: 1px solid #f0f0f0; }
        .amount-income { color: #16a34a; }
        .amount-expense { color: #dc2626; }
        .amount-transfer { color: #666; }
      </style>
    </head>
    <body>
      <h1>Transaction Report</h1>
      <p class="subtitle">Generated on ${formatDate(new Date().toISOString())}</p>
      <div class="summary">
        <div class="summary-card">
          <div class="summary-label">Total Income</div>
          <div class="summary-value income">${formatCurrency(totalIncome)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Expense</div>
          <div class="summary-value expense">${formatCurrency(totalExpense)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Net</div>
          <div class="summary-value">${formatCurrency(totalIncome - totalExpense)}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Category</th>
            <th>Type</th>
            <th style="text-align: right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${transactions
            .map(
              (tx) => `
            <tr>
              <td>${formatDate(tx.date)}</td>
              <td>${tx.title}</td>
              <td>${tx.category}</td>
              <td>${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</td>
              <td class="amount-${tx.type}" style="text-align: right">${tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}${formatCurrency(Math.abs(tx.amount))}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};

const toDateString = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
