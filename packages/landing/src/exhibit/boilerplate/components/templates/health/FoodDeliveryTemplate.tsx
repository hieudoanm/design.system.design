'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiClock, FiTruck } from 'react-icons/fi';

interface DeliveryRestaurant {
  id: string;
  name: string;
  cuisine: string;
  fee: string;
  eta: string;
  dishes: string[];
}

const DELIVERY_RESTAURANTS: DeliveryRestaurant[] = [
  {
    id: 'f1',
    name: 'Golden Dragon',
    cuisine: 'Chinese',
    fee: '$2.99 delivery',
    eta: '20-30 min',
    dishes: ['Kung Pao Chicken', 'Spring Rolls', 'Fried Rice'],
  },
  {
    id: 'f2',
    name: 'Pizza Rustica',
    cuisine: 'Italian',
    fee: '$1.99 delivery',
    eta: '25-35 min',
    dishes: ['Margherita Pizza', 'Pepperoni Pizza', 'Garlic Knots'],
  },
  {
    id: 'f3',
    name: 'Thai Orchid',
    cuisine: 'Thai',
    fee: '$3.49 delivery',
    eta: '30-40 min',
    dishes: ['Pad Thai', 'Green Curry', 'Tom Yum Soup'],
  },
  {
    id: 'f4',
    name: 'Baja Fresh',
    cuisine: 'Mexican',
    fee: '$2.49 delivery',
    eta: '15-25 min',
    dishes: ['Fish Tacos', 'Quesadilla', 'Guacamole'],
  },
  {
    id: 'f5',
    name: 'Curry Leaf',
    cuisine: 'Indian',
    fee: '$2.99 delivery',
    eta: '35-45 min',
    dishes: ['Butter Chicken', 'Biryani', 'Naan Bread'],
  },
];

export const FoodDeliveryTemplate: FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleMenu = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Delivery</h1>
        <p className="text-base-content/50 mt-1 text-sm">Order in.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-base-content/50 text-sm">
            {DELIVERY_RESTAURANTS.length} restaurants
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {DELIVERY_RESTAURANTS.map((restaurant) => {
            const isOpen = openId === restaurant.id;
            return (
              <article
                key={restaurant.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body gap-3 p-5">
                  <div className="flex flex-row items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-sm font-semibold">
                        {restaurant.name}
                      </h2>
                      <p className="text-base-content/50 flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <FiTruck className="h-3.5 w-3.5" />
                          {restaurant.fee}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiClock className="h-3.5 w-3.5" />
                          {restaurant.eta}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="badge badge-info badge-sm">
                        {restaurant.cuisine}
                      </span>
                      <button
                        onClick={() => toggleMenu(restaurant.id)}
                        className="btn btn-outline btn-sm gap-1">
                        {isOpen ? (
                          <FiChevronUp className="h-4 w-4" />
                        ) : (
                          <FiChevronDown className="h-4 w-4" />
                        )}
                        {isOpen ? 'Close menu' : 'View menu'}
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <ul className="border-base-content/10 flex list-none flex-col gap-1 border-t pt-3 text-sm">
                      {restaurant.dishes.map((dish) => (
                        <li key={dish} className="text-base-content/70">
                          {dish}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

FoodDeliveryTemplate.displayName = 'FoodDeliveryTemplate';
