'use client';

import { FormEvent, useState } from 'react';
import type { FC } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import type { MenuItem } from '@/exhibit/types/menu';
import {
  addItem,
  itemsForRestaurant,
  money,
  removeItem,
  updateItem,
} from '@/exhibit/lib/menu';
import type { MenuStore } from '@/exhibit/components/menu/types';

interface MenuManagerProps {
  restaurantId: string;
  store: MenuStore;
}

const menuItemInput = 'input input-bordered input-sm w-full bg-base-200';

interface ItemFormProps {
  restaurantId: string;
  store: MenuStore;
}

const ItemForm: FC<ItemFormProps> = ({ restaurantId, store }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'food' | 'drink'>('food');
  const [emoji, setEmoji] = useState('🍽️');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '') return;
    const cents = Math.round(parseFloat(price) * 100);
    const { state } = addItem(store.state, {
      restaurantId,
      name,
      description,
      price: cents,
      category,
      emoji,
    });
    store.setState(state);
    setName('');
    setDescription('');
    setPrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="card bg-base-200 p-4">
      <h3 className="mb-2 font-semibold">Add an item</h3>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-6">
        <div className="form-control">
          <input
            type="text"
            className={menuItemInput}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-control md:col-span-2">
          <input
            type="text"
            className={menuItemInput}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-control">
          <input
            type="number"
            step="0.01"
            min="0"
            className={menuItemInput}
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <select
            className="select select-bordered select-sm bg-base-200 w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value as 'food' | 'drink')}>
            <option value="food">Food</option>
            <option value="drink">Drink</option>
          </select>
        </div>
        <div className="form-control flex flex-row gap-2">
          <input
            type="text"
            className="input input-bordered input-sm bg-base-200 w-16"
            placeholder="🍽️"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            <FiPlus className="mr-1" />
            Add
          </button>
        </div>
      </div>
    </form>
  );
};

interface ItemRowProps {
  item: MenuItem;
  store: MenuStore;
}

const ItemRow: FC<ItemRowProps> = ({ item, store }) => (
  <li
    className={`border-base-300 flex flex-wrap items-center justify-between gap-2 border p-3 ${
      item.available ? '' : 'opacity-50'
    }`}>
    <div className="flex items-center gap-3">
      <span className="text-2xl">{item.emoji}</span>
      <div>
        <div className="font-semibold">
          {item.name}
          <span
            className={`badge badge-sm ml-2 ${
              item.category === 'food' ? 'badge-secondary' : 'badge-info'
            }`}>
            {item.category}
          </span>
        </div>
        <div className="text-base-content/60 text-sm">{item.description}</div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-mono">{money(item.price)}</span>
      <button
        className="btn btn-outline btn-xs"
        onClick={() =>
          store.setState(
            updateItem(store.state, item.id, { available: !item.available })
          )
        }>
        {item.available ? 'In stock' : 'Out of stock'}
      </button>
      <button
        className="btn btn-ghost btn-xs text-error"
        aria-label="Remove item"
        onClick={() => store.setState(removeItem(store.state, item.id))}>
        <FiTrash2 />
      </button>
    </div>
  </li>
);

const MenuManager: FC<MenuManagerProps> = ({ restaurantId, store }) => {
  const items = itemsForRestaurant(store.state, restaurantId);
  const [filter, setFilter] = useState<'all' | 'food' | 'drink'>('all');
  const visible = items.filter(
    (i: MenuItem) => filter === 'all' || i.category === filter
  );

  return (
    <div className="flex flex-col gap-4">
      <ItemForm restaurantId={restaurantId} store={store} />
      <div className="tabs tabs-boxed">
        {(['all', 'food', 'drink'] as const).map((f) => (
          <button
            key={f}
            className={`tab ${filter === f ? 'tab-active' : ''}`}
            onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f === 'food' ? 'Food' : 'Drink'}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-base-content/60">
          No items yet. Add your first item above.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((item: MenuItem) => (
            <ItemRow key={item.id} item={item} store={store} />
          ))}
        </ul>
      )}
    </div>
  );
};

export { MenuManager, type MenuManagerProps };
