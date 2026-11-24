import type { FC } from 'react';

interface Meal {
  name: string;
  time: string;
  items: string[];
  calories?: number;
}

interface MealPlanProps {
  meals: Meal[];
  title?: string;
}

export const MealPlan: FC<MealPlanProps> = ({ meals, title = 'Meal Plan' }) => (
  <div className="card bg-base-100 w-full shadow" data-testid="meal-plan">
    <div className="card-body gap-3">
      <h3 className="card-title text-base">{title}</h3>
      {meals.length === 0 ? (
        <p className="text-base-content/50 text-sm">No meals planned</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {meals.map((meal, index) => (
            <li key={meal.name} className="bg-base-200 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{meal.name}</p>
                <span className="text-base-content/50 text-xs">
                  {meal.time}
                </span>
              </div>
              <p className="text-base-content/60 mt-1 text-sm">
                {meal.items.join(', ')}
              </p>
              {meal.calories !== undefined && (
                <p
                  className="text-base-content/50 mt-1 text-xs"
                  data-testid="meal-calories">
                  {meal.calories} kcal · Meal {index + 1}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  </div>
);
