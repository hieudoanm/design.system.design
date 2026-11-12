'use client';

import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiMinus, FiPlus, FiShoppingCart } from 'react-icons/fi';
import type { MenuItem, OrderLine } from '@/exhibit/types/menu';
import {
  decodeMenuData,
  itemsForRestaurant,
  money,
  orderSubtotal,
  placeOrder,
} from '@/exhibit/lib/menu';
import { useMenuStore } from '@/exhibit/hooks/menu/useMenuStore';

const CategorySection: FC<{
  title: string;
  items: MenuItem[];
  quantities: Record<string, number>;
  onChange: (id: string, delta: number) => void;
}> = ({ title, items, quantities, onChange }) => (
  <section className="flex flex-col gap-2">
    <h2 className="px-1 text-xl font-bold">{title}</h2>
    {items.length === 0 ? (
      <p className="text-base-content/50">Nothing here yet.</p>
    ) : (
      items.map((item) => {
        const qty = quantities[item.id] ?? 0;
        return (
          <div
            key={item.id}
            className={`card bg-base-200 shadow ${
              item.available ? '' : 'opacity-50'
            }`}>
            <div className="card-body flex-row items-center gap-3 p-3">
              <span className="text-3xl">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{item.name}</div>
                <div className="text-base-content/60 truncate text-sm">
                  {item.description}
                </div>
                <div className="text-sm font-bold">{money(item.price)}</div>
              </div>
              {item.available ? (
                <div className="flex items-center gap-1">
                  {qty > 0 && (
                    <button
                      className="btn btn-circle btn-sm"
                      aria-label="Decrease quantity"
                      onClick={() => onChange(item.id, -1)}>
                      <FiMinus />
                    </button>
                  )}
                  <span className="w-8 text-center font-bold">{qty}</span>
                  <button
                    className="btn btn-circle btn-sm btn-primary"
                    aria-label="Increase quantity"
                    onClick={() => onChange(item.id, 1)}>
                    <FiPlus />
                  </button>
                </div>
              ) : (
                <span className="badge badge-ghost">Unavailable</span>
              )}
            </div>
          </div>
        );
      })
    )}
  </section>
);

const CustomerMenu: FC = () => {
  const searchParams = useSearchParams();
  const { state, setState } = useMenuStore();
  const snapshot = useMemo(
    () => decodeMenuData(searchParams.get('d') ?? ''),
    [searchParams]
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [note, setNote] = useState('');
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const restaurant = snapshot?.restaurant;
  const items = restaurant ? itemsForRestaurant(state, restaurant.id) : [];
  const effectiveItems = items.length > 0 ? items : (snapshot?.items ?? []);

  const change = (id: string, delta: number) => {
    setQuantities((q) => {
      const next = (q[id] ?? 0) + delta;
      if (next <= 0) {
        const { [id]: _remove, ...rest } = q;
        return rest;
      }
      return { ...q, [id]: next };
    });
  };

  const lines: OrderLine[] = effectiveItems
    .filter((i) => (quantities[i.id] ?? 0) > 0)
    .map((i) => ({
      itemId: i.id,
      name: i.name,
      emoji: i.emoji,
      price: i.price,
      quantity: quantities[i.id],
    }));

  const subtotal = orderSubtotal(lines);

  const handlePlace = () => {
    if (!restaurant || lines.length === 0) return;
    const { state: next, order } = placeOrder(state, {
      restaurantId: restaurant.id,
      tableNumber,
      customerName,
      note,
      lines,
    });
    setState(next);
    setOrderId(order.id);
    setPlaced(true);
  };

  if (!snapshot) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-2xl font-bold">Menu unavailable</h1>
        <p className="text-base-content/60">
          This link is missing menu data. Scan a restaurant QR code or open a
          shared menu link.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-32">
      <header className="border-base-300 bg-base-100/95 sticky top-0 z-10 -mx-4 border-b px-4 py-4 backdrop-blur">
        <h1 className="text-2xl font-bold">{snapshot.restaurant.name}</h1>
        {snapshot.restaurant.description && (
          <p className="text-base-content/60">
            {snapshot.restaurant.description}
          </p>
        )}
        {tableNumber && (
          <span className="badge badge-info mt-1">Table {tableNumber}</span>
        )}
      </header>

      <div className="mt-4 flex flex-col gap-6">
        <CategorySection
          title="Food"
          items={effectiveItems.filter((i) => i.category === 'food')}
          quantities={quantities}
          onChange={change}
        />
        <CategorySection
          title="Drinks"
          items={effectiveItems.filter((i) => i.category === 'drink')}
          quantities={quantities}
          onChange={change}
        />
      </div>

      {placed ? (
        <div className="border-base-300 bg-base-100 fixed inset-x-0 bottom-0 z-20 border-t px-4 py-4">
          <div className="flex items-start gap-3">
            <FiShoppingCart className="text-primary mt-1 text-3xl" />
            <div className="flex-1">
              <h2 className="font-bold">Order placed</h2>
              <p className="text-base-content/70 text-sm">
                Order #{orderId.slice(0, 8)} · {money(subtotal)}
              </p>
              <p className="text-base-content/70 text-sm">
                When the order is ready, you’ll be notified.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-base-300 bg-base-100 fixed inset-x-0 bottom-0 z-20 border-t px-4 py-4">
          {lines.length > 0 ? (
            <div className="mb-3 flex max-h-40 flex-col gap-1 overflow-y-auto">
              {lines.map((l) => (
                <div key={l.itemId} className="flex justify-between text-sm">
                  <span>
                    {l.emoji} {l.name} × {l.quantity}
                  </span>
                  <span>{money(l.price * l.quantity)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base-content/50 mb-2 text-sm">
              Tap + to add food or drinks to your order.
            </p>
          )}
          <div className="mb-2 flex gap-2">
            <input
              type="text"
              className="input input-bordered input-sm flex-1"
              placeholder="Your name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input
              type="text"
              className="input input-bordered input-sm w-24"
              placeholder="Table #"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
          </div>
          <input
            type="text"
            className="input input-bordered input-sm mb-2 w-full"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            className="btn btn-primary btn-block"
            disabled={lines.length === 0}
            onClick={handlePlace}>
            <FiShoppingCart className="mr-1" />
            Place order · {money(subtotal)}
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;
