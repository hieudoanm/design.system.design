'use client';

import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_ITEMS } from '@/exhibit/data/items';
import type { PosView } from '@/exhibit/components/pos/types';
import {
  addItemToCart,
  calculateSubtotal,
  calculateTax,
  removeCartItem,
  updateCartQuantity,
} from '@/exhibit/lib/pos';
import type {
  CartItem,
  Discount,
  GiftCard,
  InventoryAdjustment,
  Item,
  PaymentSplit,
  Shift,
  TaxConfig,
  Transaction,
  User,
} from '@/exhibit/types/pos';

const DEFAULT_TAX_CONFIG: TaxConfig = {
  name: 'Sales Tax',
  rate: 8.5,
  enabled: true,
};

export const usePosState = () => {
  const [view, setView] = useState<PosView>('sale');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS);
  const [adjustments, setAdjustments] = useState<InventoryAdjustment[]>([]);
  const [taxConfig, setTaxConfig] = useState<TaxConfig>(DEFAULT_TAX_CONFIG);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);

  const subtotal = useMemo(() => calculateSubtotal(cartItems), [cartItems]);
  const tax = useMemo(
    () => (taxConfig.enabled ? calculateTax(subtotal, taxConfig.rate) : 0),
    [subtotal, taxConfig]
  );
  const total = subtotal + tax;

  const addItem = useCallback((item: Item) => {
    setCartItems((prev) => addItemToCart(prev, item));
  }, []);

  const setQuantity = useCallback((itemId: string, quantity: number) => {
    setCartItems((prev) => updateCartQuantity(prev, itemId, quantity));
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCartItems((prev) => removeCartItem(prev, itemId));
  }, []);

  const completePayment = useCallback(
    (payments: PaymentSplit[]) => {
      const tx: Transaction = {
        id: crypto.randomUUID(),
        items: cartItems,
        subtotal,
        tax,
        total,
        payments,
        status: 'completed',
        createdAt: new Date().toISOString(),
        cashierId: currentUser?.id,
      };
      setTransactions((prev) => [tx, ...prev]);
      setTransaction(tx);
      setCartItems([]);
      setView('receipt');
    },
    [cartItems, subtotal, tax, total, currentUser]
  );

  const voidTransaction = useCallback((id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'voided' as const } : t))
    );
  }, []);

  const updateStock = useCallback(
    (itemId: string, newStock: number, reason: string) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      setAdjustments((prev) => [
        {
          id: crypto.randomUUID(),
          itemId,
          previousStock: item.stock,
          newStock,
          reason,
          createdAt: new Date().toISOString(),
          adjustedBy: currentUser?.name ?? 'system',
        },
        ...prev,
      ]);
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, stock: newStock } : i))
      );
    },
    [items, currentUser]
  );

  const newSale = useCallback(() => {
    setTransaction(null);
    setView('sale');
  }, []);

  const openShift = useCallback(
    (openBalance: number) => {
      const shift: Shift = {
        id: crypto.randomUUID(),
        cashierId: currentUser?.id ?? 'unknown',
        openBalance,
        status: 'open',
        startedAt: new Date().toISOString(),
      };
      setShifts((prev) => [...prev, shift]);
      setCurrentShift(shift);
    },
    [currentUser]
  );

  const closeShift = useCallback(
    (closeBalance: number) => {
      if (!currentShift) return;
      setShifts((prev) =>
        prev.map((s) =>
          s.id === currentShift.id
            ? {
                ...s,
                closeBalance,
                status: 'closed' as const,
                endedAt: new Date().toISOString(),
              }
            : s
        )
      );
      setCurrentShift(null);
    },
    [currentShift]
  );

  return {
    view,
    setView,
    cartItems,
    items,
    setItems,
    transaction,
    transactions,
    adjustments,
    taxConfig,
    setTaxConfig,
    discounts,
    setDiscounts,
    giftCards,
    setGiftCards,
    users,
    setUsers,
    currentUser,
    setCurrentUser,
    shifts,
    currentShift,
    subtotal,
    tax,
    total,
    addItem,
    setQuantity,
    removeItem,
    completePayment,
    voidTransaction,
    updateStock,
    newSale,
    openShift,
    closeShift,
  };
};

export type PosState = ReturnType<typeof usePosState>;
