'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPlus, FiShoppingCart } from 'react-icons/fi';

type DishCategory = 'Starters' | 'Mains' | 'Desserts';

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: DishCategory;
}

const DISHES: Dish[] = [
  {
    id: 'd1',
    name: 'Bruschetta',
    description: 'Toasted bread with tomato and basil.',
    price: 12,
    category: 'Starters',
  },
  {
    id: 'd2',
    name: 'Calamari Fritti',
    description: 'Crispy fried squid with lemon aioli.',
    price: 14,
    category: 'Starters',
  },
  {
    id: 'd3',
    name: 'Wild Mushroom Risotto',
    description: 'Creamy arborio rice with porcini mushrooms.',
    price: 18,
    category: 'Mains',
  },
  {
    id: 'd4',
    name: 'Grilled Salmon',
    description: 'Charred salmon over seasonal vegetables.',
    price: 18,
    category: 'Mains',
  },
  {
    id: 'd5',
    name: 'Ribeye Steak',
    description: 'Dry-aged beef with herb butter.',
    price: 18,
    category: 'Mains',
  },
  {
    id: 'd6',
    name: 'Tiramisu',
    description: 'Espresso-soaked ladyfingers with mascarpone.',
    price: 10,
    category: 'Desserts',
  },
  {
    id: 'd7',
    name: 'Panna Cotta',
    description: 'Vanilla custard with berry compote.',
    price: 10,
    category: 'Desserts',
  },
];

const CATEGORIES: Array<'All' | DishCategory> = [
  'All',
  'Starters',
  'Mains',
  'Desserts',
];

export const MenuTemplate: FC = () => {
  const [category, setCategory] = useState<'All' | DishCategory>('All');
  const [cart, setCart] = useState<string[]>([]);

  const visible = DISHES.filter(
    (dish) => category === 'All' || dish.category === category
  );

  const total = cart.reduce((sum, id) => {
    const dish = DISHES.find((item) => item.id === id);
    return dish ? sum + dish.price : sum;
  }, 0);

  const addToCart = (id: string) => {
    setCart((current) => [...current, id]);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
        <p className="text-base-content/50 mt-1 text-sm">Dishes and prices.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`tab ${category === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 flex items-center gap-1.5 text-sm">
            <FiShoppingCart className="h-4 w-4" />
            {cart.length} items · ${total}
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {visible.map((dish) => (
            <li
              key={dish.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body flex-row items-center justify-between gap-3 p-5">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold">{dish.name}</p>
                  <p className="text-base-content/50 text-xs">
                    {dish.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">${dish.price}</span>
                  <button
                    onClick={() => addToCart(dish.id)}
                    className="btn btn-primary btn-sm gap-1">
                    <FiPlus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

MenuTemplate.displayName = 'MenuTemplate';
