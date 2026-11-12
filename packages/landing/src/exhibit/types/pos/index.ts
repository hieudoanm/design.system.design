export interface Item {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  lowStockThreshold: number;
  imageUrl?: string;
}

export interface CartItem {
  item: Item;
  quantity: number;
  discount: number;
}

export type PaymentMethod = 'cash' | 'card' | 'gift_card';
export type TransactionStatus = 'completed' | 'voided' | 'refunded';

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  payments: PaymentSplit[];
  status: TransactionStatus;
  cashierId?: string;
  voidedAt?: string;
  voidReason?: string;
  createdAt: string;
}

export interface TaxConfig {
  rate: number;
  name: string;
  enabled: boolean;
}

export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
}

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  initialBalance: number;
  createdAt: string;
  active: boolean;
}

export interface InventoryAdjustment {
  id: string;
  itemId: string;
  previousStock: number;
  newStock: number;
  reason: string;
  adjustedBy?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier';
  pin: string;
  active: boolean;
}

export interface Shift {
  id: string;
  cashierId: string;
  openBalance: number;
  closeBalance?: number;
  startedAt: string;
  endedAt?: string;
  status: 'open' | 'closed';
}

export interface CashRegister {
  id: string;
  name: string;
  currentShiftId?: string;
  status: 'idle' | 'active';
}

export type ReportPeriod = 'daily' | 'weekly' | 'monthly';

export interface DailySummary {
  date: string;
  transactionCount: number;
  totalSales: number;
  totalTax: number;
  totalVoided: number;
  cashTotal: number;
  cardTotal: number;
  giftCardTotal: number;
  topItems: { itemId: string; name: string; quantity: number; total: number }[];
}

export interface SalesReport {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  transactions: Transaction[];
  summary: DailySummary[];
  totalSales: number;
  totalTax: number;
  byPaymentMethod: Record<PaymentMethod, number>;
  byCategory: Record<string, number>;
}
