import type { Transaction } from '@/exhibit/types/pos';

export interface ItemSaleTotal {
  id: string;
  name: string;
  quantity: number;
  total: number;
}

export interface PaymentMethodTotals {
  cash: number;
  card: number;
  gift_card: number;
}

export interface SalesReport {
  count: number;
  totalSales: number;
  totalTax: number;
  byPayment: PaymentMethodTotals;
  byCategory: Record<string, number>;
  topItems: ItemSaleTotal[];
}

export const TOP_ITEM_LIMIT = 5;

export const accumulateItemTotals = (
  transactions: Transaction[]
): Record<string, ItemSaleTotal> => {
  const totals: Record<string, ItemSaleTotal> = {};
  for (const t of transactions) {
    for (const ci of t.items) {
      const line = ci.item.price * ci.quantity;
      const existing = totals[ci.item.id];
      totals[ci.item.id] = existing
        ? {
            ...existing,
            quantity: existing.quantity + ci.quantity,
            total: existing.total + line,
          }
        : {
            id: ci.item.id,
            name: ci.item.name,
            quantity: ci.quantity,
            total: line,
          };
    }
  }
  return totals;
};

export const buildSalesReport = (
  transactions: Transaction[],
  limit: number = TOP_ITEM_LIMIT
): SalesReport => {
  const byPayment: PaymentMethodTotals = { cash: 0, card: 0, gift_card: 0 };
  const byCategory: Record<string, number> = {};

  for (const t of transactions) {
    for (const p of t.payments) byPayment[p.method] += p.amount;
    for (const ci of t.items) {
      const line = ci.item.price * ci.quantity;
      byCategory[ci.item.category] = (byCategory[ci.item.category] ?? 0) + line;
    }
  }

  const topItems = Object.values(accumulateItemTotals(transactions))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);

  return {
    count: transactions.length,
    totalSales: transactions.reduce((s, t) => s + t.total, 0),
    totalTax: transactions.reduce((s, t) => s + t.tax, 0),
    byPayment,
    byCategory,
    topItems,
  };
};
