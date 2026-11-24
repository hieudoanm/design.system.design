'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheckCircle, FiList } from 'react-icons/fi';

interface Macro {
  name: string;
  current: number;
  goal: number;
}

interface Meal {
  id: string;
  slot: string;
  name: string;
  calories: number;
}

const MACROS: Macro[] = [
  { name: 'Protein', current: 120, goal: 150 },
  { name: 'Carbs', current: 180, goal: 250 },
  { name: 'Fat', current: 65, goal: 80 },
];

const MEALS: Meal[] = [
  { id: 'm1', slot: 'Breakfast', name: 'Oatmeal with berries', calories: 320 },
  { id: 'm2', slot: 'Lunch', name: 'Chicken quinoa bowl', calories: 580 },
  {
    id: 'm3',
    slot: 'Dinner',
    name: 'Grilled salmon and veggies',
    calories: 640,
  },
  { id: 'm4', slot: 'Snack', name: 'Greek yogurt and almonds', calories: 250 },
];

export const NutritionTrackerTemplate: FC = () => {
  const [logged, setLogged] = useState<Record<string, boolean>>({});

  const total = MEALS.reduce((sum, meal) => sum + meal.calories, 0);

  const logMeal = (id: string) => {
    setLogged((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Nutrition Tracker</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Daily macros and meals.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Daily Macros</h2>
          <p className="text-base-content/50 text-sm">3 macros</p>
        </div>

        <div className="mt-3 space-y-4">
          {MACROS.map((macro) => (
            <div
              key={macro.name}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-2 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{macro.name}</p>
                  <p className="text-base-content/50 text-xs">
                    {macro.current} / {macro.goal} g
                  </p>
                </div>
                <progress
                  className="progress progress-primary"
                  value={macro.current}
                  max={macro.goal}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <FiList className="text-primary" /> Meal Log
          </h2>
          <p className="text-base-content/50 text-sm">4 meals logged</p>
        </div>

        <div className="card bg-base-200 border-base-content/10 mt-3 border">
          <div className="card-body p-5">
            <table className="table">
              <thead>
                <tr>
                  <th>Meal</th>
                  <th>Food</th>
                  <th>Calories</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {MEALS.map((meal) => (
                  <tr key={meal.id}>
                    <td>{meal.slot}</td>
                    <td>{meal.name}</td>
                    <td>{meal.calories} kcal</td>
                    <td>
                      {logged[meal.id] ? (
                        <span className="badge badge-success gap-1">
                          <FiCheckCircle />
                          Logged
                        </span>
                      ) : (
                        <button
                          onClick={() => logMeal(meal.id)}
                          className="btn btn-ghost btn-xs">
                          Log meal
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-base-content/10 mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm font-medium">Total</p>
              <p className="text-sm font-semibold">{total} kcal</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

NutritionTrackerTemplate.displayName = 'NutritionTrackerTemplate';
