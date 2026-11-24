'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheckCircle, FiClock, FiStar, FiUsers, FiZap } from 'react-icons/fi';

const NAME = 'Garlic Butter Salmon';
const CATEGORY = 'Dinner';
const COOK_TIME = 30;
const SERVINGS = 4;
const RATING = 4.7;

const INGREDIENTS = [
  'Salmon fillets',
  'Butter',
  'Garlic cloves',
  'Lemon',
  'Fresh dill',
];

const STEPS = [
  'Preheat the oven to 200°C.',
  'Pan-sear the salmon skin side down.',
  'Spoon garlic butter over the fish and finish in the oven.',
];

export const RecipeDetailTemplate: FC = () => {
  const [cooking, setCooking] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);

  const toggleIngredient = (ingredient: string) => {
    setChecked((current) =>
      current.includes(ingredient)
        ? current.filter((item) => item !== ingredient)
        : [...current, ingredient]
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Recipe</h1>
        <p className="text-base-content/50 mt-1 text-sm">Step by step.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <article className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold tracking-tight">{NAME}</h2>
              <span className="badge badge-neutral badge-sm">{CATEGORY}</span>
            </div>

            <p className="text-base-content/50 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <FiClock className="h-3.5 w-3.5" />
                {COOK_TIME} min
              </span>
              <span className="flex items-center gap-1">
                <FiUsers className="h-3.5 w-3.5" />
                {SERVINGS} servings
              </span>
              <span className="flex items-center gap-1">
                <FiStar className="h-3.5 w-3.5" />
                {RATING} rating
              </span>
            </p>

            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-sm font-medium">
                <FiCheckCircle className="h-3.5 w-3.5" />
                Ingredients
              </p>
              <ul className="flex flex-col gap-2">
                {INGREDIENTS.map((ingredient) => (
                  <li key={ingredient} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked.includes(ingredient)}
                      onChange={() => toggleIngredient(ingredient)}
                      aria-label={ingredient}
                      className="checkbox checkbox-sm"
                    />
                    <span
                      className={`text-sm ${
                        checked.includes(ingredient)
                          ? 'text-base-content/50 line-through'
                          : ''
                      }`}>
                      {ingredient}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Steps</p>
              <ol className="text-base-content/50 flex list-decimal flex-col gap-1 pl-5 text-sm">
                {STEPS.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>

            <div className="border-base-content/10 mt-2 border-t pt-4">
              {cooking ? (
                <span className="badge badge-info badge-sm">
                  Cooking in progress
                </span>
              ) : (
                <button
                  onClick={() => setCooking(true)}
                  className="btn btn-primary btn-sm gap-1">
                  <FiZap className="h-4 w-4" />
                  Start cooking
                </button>
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

RecipeDetailTemplate.displayName = 'RecipeDetailTemplate';
