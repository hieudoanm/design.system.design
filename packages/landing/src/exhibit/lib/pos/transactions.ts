import type { ReportPeriod, Transaction } from '@/exhibit/types/pos';

export const getPeriodStart = (
  period: ReportPeriod,
  now: Date = new Date()
): Date => {
  const start = new Date(now);
  if (period === 'daily') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    start.setDate(now.getDate() - 7);
  } else {
    start.setMonth(now.getMonth() - 1);
  }
  return start;
};

export const filterCompletedInPeriod = (
  transactions: Transaction[],
  period: ReportPeriod,
  now: Date = new Date()
): Transaction[] => {
  const start = getPeriodStart(period, now).toISOString();
  return transactions.filter(
    (t) => t.createdAt >= start && t.status === 'completed'
  );
};

export const filterTransactionsBySearch = (
  transactions: Transaction[],
  search: string
): Transaction[] => {
  if (!search) return transactions;
  const query = search.toLowerCase();
  return transactions.filter(
    (t) =>
      t.id.toLowerCase().includes(query) ||
      t.items.some((i) => i.item.name.toLowerCase().includes(query))
  );
};
