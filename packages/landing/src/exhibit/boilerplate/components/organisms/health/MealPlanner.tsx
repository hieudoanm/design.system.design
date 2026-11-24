import type { FC } from 'react';

interface MealItem {
  name: string;
  calories: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface DayMeals {
  day: string;
  items: MealItem[];
}

interface MealPlannerProps {
  meals: DayMeals[];
  title?: string;
}

const typeBadge: Record<MealItem['type'], string> = {
  breakfast: 'badge-info',
  lunch: 'badge-success',
  dinner: 'badge-primary',
  snack: 'badge-warning',
};

export const MealPlanner: FC<MealPlannerProps> = ({
  meals,
  title = 'Meal plan',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-4">
      <h3 className="card-title">{title}</h3>
      {meals.map((day) => {
        const totalCalories = day.items.reduce(
          (sum, item) => sum + item.calories,
          0
        );
        return (
          <div key={day.day} className="bg-base-100 rounded-xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium">{day.day}</h4>
              <span className="badge badge-ghost badge-sm">
                {totalCalories} kcal
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              {day.items.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between gap-2">
                  <span className="text-sm">{item.name}</span>
                  <span className="flex items-center gap-2">
                    <span className={`badge badge-sm ${typeBadge[item.type]}`}>
                      {item.type}
                    </span>
                    <span className="text-base-content/50 text-xs">
                      {item.calories} kcal
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {meals.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No meals planned.
        </p>
      )}
    </div>
  </section>
);
