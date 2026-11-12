'use client';

import { FormEvent, useState } from 'react';
import type { FC } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import type { Restaurant, MenuItem } from '@/exhibit/types/menu';
import { accentOptions, createRestaurant, deleteRestaurant } from '@/exhibit/lib/menu';
import type { MenuStore } from '@/exhibit/components/menu/types';

interface RestaurantManagerProps {
  store: MenuStore;
  selected: Restaurant | null;
  onSelect: (r: Restaurant) => void;
}

const RestaurantManager: FC<RestaurantManagerProps> = ({
  store,
  selected,
  onSelect,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accent, setAccent] = useState(accentOptions[0]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { state, restaurant } = createRestaurant(store.state, {
      name,
      description,
      accent,
      tableCount: 1,
    });
    store.setState(state);
    onSelect(restaurant);
    setName('');
    setDescription('');
  };

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body gap-4">
        <h1 className="text-3xl font-bold">Menus</h1>
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-end gap-2">
          <div className="form-control w-full max-w-56">
            <label className="label" htmlFor="restaurant-name">
              <span className="label-text">Restaurant name</span>
            </label>
            <input
              id="restaurant-name"
              type="text"
              className="input input-bordered input-sm"
              placeholder="e.g. The Golden Fork"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-control w-full max-w-72">
            <label className="label" htmlFor="restaurant-description">
              <span className="label-text">Description</span>
            </label>
            <input
              id="restaurant-description"
              type="text"
              className="input input-bordered input-sm"
              placeholder="e.g. Wood-fired pizzas & craft beer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label" htmlFor="restaurant-accent">
              <span className="label-text">Accent</span>
            </label>
            <select
              id="restaurant-accent"
              className="select select-bordered select-sm"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}>
              {accentOptions.map((a: string) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            <FiPlus className="mr-1" />
            Create
          </button>
        </form>

        {store.state.restaurants.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {store.state.restaurants.map((r: Restaurant) => (
              <div
                key={r.id}
                className={`card flex flex-row items-center gap-2 border p-3 ${
                  selected?.id === r.id ? 'border-primary' : ''
                }`}>
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-base-content/60 text-sm">
                    {
                      store.state.items.filter(
                        (i: MenuItem) => i.restaurantId === r.id
                      ).length
                    }{' '}
                    items · {r.id.slice(0, 8)}
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onSelect(r)}>
                  Open
                </button>
                <button
                  className="btn btn-ghost btn-sm text-error"
                  aria-label="Delete"
                  onClick={() => {
                    store.setState(deleteRestaurant(store.state, r.id));
                  }}>
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { RestaurantManager, type RestaurantManagerProps };
