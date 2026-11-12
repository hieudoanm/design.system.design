import type { CartItem, Item } from '@/exhibit/types/pos';

export const calculateSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

export const calculateTax = (subtotal: number, rate: number): number =>
  subtotal * (rate / 100);

export const addItemToCart = (cart: CartItem[], item: Item): CartItem[] => {
  const existing = cart.find((ci) => ci.item.id === item.id);
  if (existing) {
    return cart.map((ci) =>
      ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
    );
  }
  return [...cart, { item, quantity: 1, discount: 0 }];
};

export const updateCartQuantity = (
  cart: CartItem[],
  itemId: string,
  quantity: number
): CartItem[] => {
  if (quantity <= 0) {
    return cart.filter((ci) => ci.item.id !== itemId);
  }
  return cart.map((ci) => (ci.item.id === itemId ? { ...ci, quantity } : ci));
};

export const removeCartItem = (cart: CartItem[], itemId: string): CartItem[] =>
  cart.filter((ci) => ci.item.id !== itemId);
