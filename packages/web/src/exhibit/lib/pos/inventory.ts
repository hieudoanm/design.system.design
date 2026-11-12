import type { Item } from '@/exhibit/types/pos';

export const isLowStock = (item: Item): boolean =>
  item.stock <= item.lowStockThreshold;

export const filterLowStockItems = (items: Item[]): Item[] =>
  items.filter(isLowStock);
