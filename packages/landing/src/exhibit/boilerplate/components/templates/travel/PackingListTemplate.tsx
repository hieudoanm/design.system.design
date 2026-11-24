'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheckCircle, FiPlus } from 'react-icons/fi';

type ItemCategory = 'Essentials' | 'Clothes' | 'Tech' | 'Toiletries';

interface PackingItem {
  id: string;
  name: string;
  category: ItemCategory;
  packed: boolean;
}

const INITIAL_ITEMS: PackingItem[] = [
  { id: 'p1', name: 'Passport', category: 'Essentials', packed: false },
  { id: 'p2', name: 'Sunscreen', category: 'Toiletries', packed: false },
  { id: 'p3', name: 'Camera', category: 'Tech', packed: false },
  { id: 'p4', name: 'Sandals', category: 'Clothes', packed: false },
  { id: 'p5', name: 'Umbrella', category: 'Essentials', packed: false },
  { id: 'p6', name: 'Charger', category: 'Tech', packed: false },
];

export const PackingListTemplate: FC = () => {
  const [items, setItems] = useState<PackingItem[]>(INITIAL_ITEMS);
  const [name, setName] = useState('');

  const packedCount = items.filter((item) => item.packed).length;

  const togglePacked = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, packed: !item.packed } : item
      )
    );
  };

  const addItem = () => {
    const trimmedName = name.trim();
    if (trimmedName === '') return;
    setItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        name: trimmedName,
        category: 'Essentials',
        packed: false,
      },
    ]);
    setName('');
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Packing List</h1>
        <p className="text-base-content/50 mt-1 text-sm">What to pack.</p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base-content/50 text-sm">{items.length} items</p>
          <p className="text-base-content/50 text-sm">
            {packedCount} of {items.length} packed
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex flex-col gap-3 p-5 sm:flex-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunglasses"
              aria-label="Item name"
              className="input input-bordered input-sm flex-1"
            />
            <button
              type="button"
              onClick={addItem}
              className="btn btn-primary btn-sm gap-1">
              <FiPlus />
              Add
            </button>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {items.map((item) => (
              <div
                key={item.id}
                className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
                <input
                  type="checkbox"
                  aria-label={item.name}
                  checked={item.packed}
                  onChange={() => togglePacked(item.id)}
                  className="checkbox checkbox-sm"
                />
                <FiCheckCircle className="text-base-content/30 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                </div>
                <span className="badge badge-ghost badge-sm">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

PackingListTemplate.displayName = 'PackingListTemplate';
