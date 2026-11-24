import type { FC } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiShoppingCart, FiChevronRight, FiPackage } from 'react-icons/fi';

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  items: number;
}

const orders: Order[] = [
  {
    id: 'ORD-2024-3847',
    date: 'Jan 28, 2024',
    total: 746,
    status: 'Processing',
    items: 4,
  },
  {
    id: 'ORD-2024-2912',
    date: 'Dec 15, 2023',
    total: 159,
    status: 'Delivered',
    items: 1,
  },
  {
    id: 'ORD-2024-1834',
    date: 'Nov 3, 2023',
    total: 428,
    status: 'Delivered',
    items: 2,
  },
  {
    id: 'ORD-2024-0921',
    date: 'Sep 22, 2023',
    total: 89,
    status: 'Delivered',
    items: 1,
  },
];

const statusColor = (status: string) => {
  if (status === 'Delivered') return 'badge-success';
  if (status === 'Processing') return 'badge-warning';
  return 'badge-ghost';
};

export const OrderHistoryTemplate: FC = () => (
  <div className="flex min-h-dvh flex-col">
    <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-3 backdrop-blur-sm">
      <Link href="/" className="text-lg font-bold tracking-tight">
        Boilerplate
      </Link>
      <div className="flex items-center gap-1">
        <Link href="/store/cart" className="btn btn-ghost btn-sm relative">
          <FiShoppingCart className="h-4 w-4" />
        </Link>
        <Link href="/auth/sign-in" className="btn btn-primary btn-sm">
          Sign in
        </Link>
      </div>
    </header>

    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <div className="mb-8 flex items-center gap-2 text-sm">
        <Link
          href="/store"
          className="text-base-content/50 hover:text-primary transition-colors">
          Store
        </Link>
        <FiChevronRight className="text-base-content/30 h-3 w-3" />
        <span>Order history</span>
      </div>

      <h1 className="mb-8 text-2xl">Order history</h1>

      {orders.length === 0 ? (
        <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-4 rounded-2xl border py-24 text-center">
          <FiPackage className="text-base-content/20 h-12 w-12" />
          <p className="text-base-content/50 text-sm">No orders yet.</p>
          <Link href="/store" className="btn btn-primary btn-sm">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border-base-content/10 bg-base-200 hover:border-primary/50 flex items-center justify-between rounded-xl border p-5 transition-colors">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">{order.id}</p>
                  <span
                    className={`badge badge-sm ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-base-content/50 mt-1 flex items-center gap-3 text-xs">
                  <span>{order.date}</span>
                  <span className="text-base-content/20">&middot;</span>
                  <span>{order.items} items</span>
                  <span className="text-base-content/20">&middot;</span>
                  <span>${order.total}</span>
                </div>
              </div>
              <FiChevronRight className="text-base-content/30 h-4 w-4 shrink-0" />
            </div>
          ))}
        </div>
      )}
    </main>

    <footer className="border-base-300 border-t px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-primary text-lg font-bold tracking-tight">
          Boilerplate
        </p>
        <p className="text-base-content/50 text-xs">
          &copy; {new Date().getFullYear()} Boilerplate Store &middot; Built
          with care
        </p>
      </div>
    </footer>
  </div>
);

OrderHistoryTemplate.displayName = 'OrderHistoryTemplate';
