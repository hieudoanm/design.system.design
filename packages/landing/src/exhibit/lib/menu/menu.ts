import type {
  MenuItem,
  MenuState,
  Order,
  OrderLine,
  Restaurant,
} from '@/exhibit/types/menu';
import { newId, nowIso } from '@/exhibit/lib/menu/ids';

export const emptyMenu = (): MenuState => ({
  restaurants: [],
  items: [],
  orders: [],
});

export const accentOptions: string[] = [
  'primary',
  'secondary',
  'accent',
  'success',
  'info',
  'warning',
  'error',
];

export interface RestaurantInput {
  name: string;
  description?: string;
  accent: string;
  tableCount: number;
}

export const createRestaurant = (
  state: MenuState,
  input: RestaurantInput
): { state: MenuState; restaurant: Restaurant } => {
  const restaurant: Restaurant = {
    id: newId(),
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    accent: accentOptions.includes(input.accent) ? input.accent : 'primary',
    tableCount: Math.max(1, Math.min(99, input.tableCount)),
    createdAt: nowIso(),
  };
  return {
    state: { ...state, restaurants: [...state.restaurants, restaurant] },
    restaurant,
  };
};

export const updateRestaurant = (
  state: MenuState,
  id: string,
  patch: Partial<Omit<Restaurant, 'id' | 'createdAt'>>
): MenuState => ({
  ...state,
  restaurants: state.restaurants.map((r: Restaurant) =>
    r.id === id ? { ...r, ...patch } : r
  ),
});

export const deleteRestaurant = (state: MenuState, id: string): MenuState => ({
  ...state,
  restaurants: state.restaurants.filter((r: Restaurant) => r.id !== id),
  items: state.items.filter((i: MenuItem) => i.restaurantId !== id),
  orders: state.orders.filter((o: Order) => o.restaurantId !== id),
});

export interface MenuItemInput {
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  category: 'food' | 'drink';
  emoji: string;
}

export const addItem = (
  state: MenuState,
  input: MenuItemInput
): { state: MenuState; item: MenuItem } => {
  const nextOrder =
    state.items.filter((i: MenuItem) => i.restaurantId === input.restaurantId)
      .length + 1;
  const item: MenuItem = {
    id: newId(),
    restaurantId: input.restaurantId,
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    price: Math.max(0, input.price),
    category: input.category,
    emoji: input.emoji.trim() || '🍽️',
    available: true,
    sortOrder: nextOrder,
    createdAt: nowIso(),
  };
  return { state: { ...state, items: [...state.items, item] }, item };
};

export const updateItem = (
  state: MenuState,
  id: string,
  patch: Partial<Omit<MenuItem, 'id' | 'restaurantId' | 'createdAt'>>
): MenuState => ({
  ...state,
  items: state.items.map((i: MenuItem) =>
    i.id === id ? { ...i, ...patch } : i
  ),
});

export const removeItem = (state: MenuState, id: string): MenuState => ({
  ...state,
  items: state.items.filter((i: MenuItem) => i.id !== id),
});

export const toggleItemAvailable = (
  state: MenuState,
  id: string
): MenuState => ({
  ...state,
  items: state.items.map((i: MenuItem) =>
    i.id === id ? { ...i, available: !i.available } : i
  ),
});

export const itemsForRestaurant = (
  state: MenuState,
  restaurantId: string
): MenuItem[] =>
  state.items
    .filter((i: MenuItem) => i.restaurantId === restaurantId)
    .sort((a: MenuItem, b: MenuItem) => a.sortOrder - b.sortOrder);

export const restaurantById = (
  state: MenuState,
  id: string
): Restaurant | undefined =>
  state.restaurants.find((r: Restaurant) => r.id === id);

export const orderSubtotal = (lines: OrderLine[]): number =>
  Math.round(
    lines.reduce(
      (sum: number, line: OrderLine) => sum + line.price * line.quantity,
      0
    ) * 100
  ) / 100;

export interface OrderInput {
  restaurantId: string;
  tableNumber?: string;
  customerName?: string;
  note?: string;
  lines: OrderLine[];
}

export const placeOrder = (
  state: MenuState,
  input: OrderInput
): { state: MenuState; order: Order } => {
  const subtotal = orderSubtotal(input.lines);
  const order: Order = {
    id: newId(),
    restaurantId: input.restaurantId,
    tableNumber: input.tableNumber?.trim() || undefined,
    customerName: input.customerName?.trim() || undefined,
    note: input.note?.trim() || undefined,
    lines: input.lines,
    subtotal,
    createdAt: nowIso(),
    status: 'placed',
  };
  return { state: { ...state, orders: [...state.orders, order] }, order };
};

export const updateOrderStatus = (
  state: MenuState,
  id: string,
  status: Order['status']
): MenuState => ({
  ...state,
  orders: state.orders.map((o: Order) => (o.id === id ? { ...o, status } : o)),
});

export const ordersForRestaurant = (
  state: MenuState,
  restaurantId: string
): Order[] =>
  state.orders
    .filter((o: Order) => o.restaurantId === restaurantId)
    .sort((a: Order, b: Order) => (a.createdAt < b.createdAt ? 1 : -1));

export const money = (value: number): string =>
  (value / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

export interface MenuSnapshot {
  v: number;
  restaurant: Restaurant;
  items: MenuItem[];
}

export const encodeMenuData = (
  restaurant: Restaurant,
  items: MenuItem[]
): string => {
  const snapshot: MenuSnapshot = { v: 1, restaurant, items };
  const json = JSON.stringify(snapshot);
  if (typeof btoa === 'undefined') return encodeURIComponent(json);
  return btoa(String.fromCharCode(...new TextEncoder().encode(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const decodeMenuData = (payload: string): MenuSnapshot | null => {
  try {
    let json: string;
    if (typeof atob === 'undefined') {
      json = decodeURIComponent(payload);
    } else {
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const bin = atob(base64);
      json = new TextDecoder().decode(
        new Uint8Array(bin.length).map((_, i) => bin.charCodeAt(i))
      );
    }
    const parsed = JSON.parse(json) as MenuSnapshot;
    if (parsed.v !== 1 || !parsed.restaurant || !Array.isArray(parsed.items)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const makeCustomerUrl = (
  restaurant: Restaurant,
  items: MenuItem[]
): string => `/design-system/exhibits/menu`;
