'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock, FiSearch, FiStar, FiUsers } from 'react-icons/fi';

type RecipeCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert';

interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  cookTime: number;
  servings: number;
  rating: number;
}

const RECIPES: Recipe[] = [
  {
    id: 'rc1',
    name: 'Fluffy Pancakes',
    category: 'Breakfast',
    cookTime: 25,
    servings: 4,
    rating: 4.6,
  },
  {
    id: 'rc2',
    name: 'Avocado Toast',
    category: 'Breakfast',
    cookTime: 15,
    servings: 2,
    rating: 4.8,
  },
  {
    id: 'rc3',
    name: 'Caesar Salad',
    category: 'Lunch',
    cookTime: 20,
    servings: 3,
    rating: 4.5,
  },
  {
    id: 'rc4',
    name: 'Beef Tacos',
    category: 'Lunch',
    cookTime: 35,
    servings: 4,
    rating: 4.7,
  },
  {
    id: 'rc5',
    name: 'Garlic Butter Salmon',
    category: 'Dinner',
    cookTime: 30,
    servings: 4,
    rating: 4.7,
  },
  {
    id: 'rc6',
    name: 'Chocolate Lava Cake',
    category: 'Dessert',
    cookTime: 40,
    servings: 6,
    rating: 4.9,
  },
];

export const RecipesTemplate: FC = () => {
  const [query, setQuery] = useState('');

  const filtered = RECIPES.filter((recipe) =>
    recipe.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Recipes</h1>
        <p className="text-base-content/50 mt-1 text-sm">Cook at home.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="text-base-content/40 absolute top-2 left-3" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search recipes..."
              aria-label="Search recipes"
              className="input input-bordered input-sm w-full pl-9"
            />
          </div>
          <p className="text-base-content/50 text-sm">
            {filtered.length} recipes
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
            <FiSearch className="text-base-content/20 h-8 w-8" />
            <p className="text-base-content/50 text-sm">No recipes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((recipe) => (
              <article
                key={recipe.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body gap-2 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold">{recipe.name}</h2>
                    <span className="badge badge-neutral badge-sm">
                      {recipe.category}
                    </span>
                  </div>
                  <p className="text-base-content/50 flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <FiClock className="h-3.5 w-3.5" />
                      {recipe.cookTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers className="h-3.5 w-3.5" />
                      {recipe.servings} servings
                    </span>
                    <span className="flex items-center gap-1">
                      <FiStar className="h-3.5 w-3.5" />
                      {recipe.rating} rating
                    </span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

RecipesTemplate.displayName = 'RecipesTemplate';
