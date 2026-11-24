'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  threshold: number;
}

const ITEMS: InventoryItem[] = [
  { id: 'i1', name: 'Ergonomic Chair', sku: 'CH-001', stock: 4, threshold: 5 },
  {
    id: 'i2',
    name: 'Mechanical Keyboard',
    sku: 'KB-002',
    stock: 11,
    threshold: 10,
  },
  {
    id: 'i3',
    name: 'Studio Headphones',
    sku: 'HP-003',
    stock: 2,
    threshold: 5,
  },
  { id: 'i4', name: 'Wireless Mouse', sku: 'MS-004', stock: 32, threshold: 20 },
  { id: 'i5', name: 'Desk Lamp', sku: 'LM-005', stock: 3, threshold: 6 },
  { id: 'i6', name: 'Monitor Stand', sku: 'MS-006', stock: 10, threshold: 10 },
];

export const InventoryTemplate: FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(ITEMS);

  const lowCount = items.filter((item) => item.stock <= item.threshold).length;

  const changeStock = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, stock: Math.max(0, item.stock + delta) }
          : item
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Monitor stock levels across the catalog.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-base-content/50 text-sm">
            {lowCount} items low on stock
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">SKU</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.sku}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => changeStock(item.id, -1)}
                            aria-label={`Decrease ${item.name}`}
                            className="btn btn-ghost btn-xs btn-square">
                            <FiMinus />
                          </button>
                          <span className="min-w-8 text-center text-sm">
                            {item.stock}
                          </span>
                          <button
                            onClick={() => changeStock(item.id, 1)}
                            aria-label={`Increase ${item.name}`}
                            className="btn btn-ghost btn-xs btn-square">
                            <FiPlus />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {item.stock <= item.threshold ? (
                          <span className="badge badge-warning badge-sm">
                            Low stock
                          </span>
                        ) : (
                          <span className="badge badge-neutral badge-sm">
                            {item.stock} in stock
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

InventoryTemplate.displayName = 'InventoryTemplate';
