export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  accent: string;
  tableCount: number;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  category: 'food' | 'drink';
  emoji: string;
  available: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface OrderLine {
  itemId: string;
  name: string;
  emoji: string;
  price: number;
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  tableNumber?: string;
  customerName?: string;
  note?: string;
  lines: OrderLine[];
  subtotal: number;
  createdAt: string;
  status: 'placed' | 'served' | 'cancelled' | 'paid';
}

export interface MenuState {
  restaurants: Restaurant[];
  items: MenuItem[];
  orders: Order[];
}
