'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock, FiSearch, FiStar } from 'react-icons/fi';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
}

const RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Trattoria Fiore',
    cuisine: 'Italian',
    rating: 4.5,
    deliveryTime: 25,
  },
  {
    id: 'r2',
    name: 'Casa del Sole',
    cuisine: 'Italian',
    rating: 4.7,
    deliveryTime: 30,
  },
  {
    id: 'r3',
    name: 'Sakura House',
    cuisine: 'Japanese',
    rating: 4.8,
    deliveryTime: 20,
  },
  {
    id: 'r4',
    name: 'Ramen Kaze',
    cuisine: 'Japanese',
    rating: 4.4,
    deliveryTime: 35,
  },
  {
    id: 'r5',
    name: 'Green Garden',
    cuisine: 'Vegan',
    rating: 4.6,
    deliveryTime: 45,
  },
  {
    id: 'r6',
    name: 'Root & Leaf',
    cuisine: 'Vegan',
    rating: 4.9,
    deliveryTime: 40,
  },
];

const CUISINES = ['All', 'Italian', 'Japanese', 'Vegan'];

export const RestaurantListTemplate: FC = () => {
  const [cuisine, setCuisine] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = RESTAURANTS.filter((restaurant) => {
    const matchesCuisine = cuisine === 'All' || restaurant.cuisine === cuisine;
    const matchesQuery = restaurant.name
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesCuisine && matchesQuery;
  });

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Restaurants</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Find a place to eat.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="text-base-content/40 absolute top-2 left-3" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search restaurants..."
              aria-label="Search restaurants"
              className="input input-bordered input-sm w-full pl-9"
            />
          </div>
          <p className="text-base-content/50 text-sm">
            {filtered.length} restaurants
          </p>
        </div>

        <div className="tabs tabs-boxed tabs-sm mb-6 w-fit">
          {CUISINES.map((item) => (
            <button
              key={item}
              onClick={() => setCuisine(item)}
              className={`tab ${cuisine === item ? 'tab-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
            <FiSearch className="text-base-content/20 h-8 w-8" />
            <p className="text-base-content/50 text-sm">No restaurants found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((restaurant) => (
              <article
                key={restaurant.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body flex-row items-center justify-between gap-3 p-5">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-semibold">{restaurant.name}</h2>
                    <p className="text-base-content/50 flex flex-wrap items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <FiStar className="h-3.5 w-3.5" />
                        {restaurant.rating} rating
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="h-3.5 w-3.5" />
                        {restaurant.deliveryTime} min
                      </span>
                    </p>
                  </div>
                  <span className="badge badge-info badge-sm">
                    {restaurant.cuisine}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

RestaurantListTemplate.displayName = 'RestaurantListTemplate';
