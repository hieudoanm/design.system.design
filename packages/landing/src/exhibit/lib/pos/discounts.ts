import type {
  Discount,
  GiftCard,
  PaymentMethod,
  PaymentSplit,
} from '@/exhibit/types/pos';

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'cash',
  'card',
  'gift_card',
];

export const isDiscountRedeemable = (
  discount: Discount,
  total: number,
  now: Date = new Date()
): boolean => {
  if (!discount.active) return false;
  if (discount.maxUses && discount.usedCount >= discount.maxUses) return false;
  if (discount.expiresAt && new Date(discount.expiresAt) < now) return false;
  if (discount.minPurchase && total < discount.minPurchase) return false;
  return true;
};

export const findRedeemableDiscount = (
  code: string,
  discounts: Discount[],
  total: number
): Discount | null => {
  const match = discounts.find(
    (d) => d.code.toLowerCase() === code.trim().toLowerCase()
  );
  if (!match || !isDiscountRedeemable(match, total)) return null;
  return match;
};

export const calculateDiscountAmount = (
  discount: Discount | null,
  total: number
): number => {
  if (!discount) return 0;
  if (discount.type === 'percentage') {
    return total * (discount.value / 100);
  }
  return Math.min(discount.value, total);
};

export const findActiveGiftCard = (
  code: string,
  giftCards: GiftCard[]
): GiftCard | null => {
  const match = giftCards.find(
    (g) => g.code.toLowerCase() === code.trim().toLowerCase() && g.active
  );
  if (!match || match.balance <= 0) return null;
  return match;
};

export const getNextUnusedPaymentMethod = (
  splits: PaymentSplit[]
): PaymentMethod | null =>
  PAYMENT_METHODS.find((m) => !splits.some((s) => s.method === m)) ?? null;
