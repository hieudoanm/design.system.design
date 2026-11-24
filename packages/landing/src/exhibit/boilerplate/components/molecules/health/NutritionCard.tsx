import type { FC } from 'react';

interface Nutrient {
  label: string;
  consumed: number;
  target: number;
  unit: string;
}

interface NutritionCardProps {
  calories: Nutrient;
  protein: Nutrient;
  carbs: Nutrient;
  fat: Nutrient;
}

const nutrientClasses = [
  'progress-primary',
  'progress-secondary',
  'progress-accent',
  'progress-info',
];

export const NutritionCard: FC<NutritionCardProps> = ({
  calories,
  protein,
  carbs,
  fat,
}) => {
  const items = [calories, protein, carbs, fat];
  return (
    <div
      className="card bg-base-100 w-full shadow"
      data-testid="nutrition-card">
      <div className="card-body gap-3">
        <h3 className="card-title text-base">Nutrition</h3>
        {items.map((item, index) => {
          const pct =
            item.target > 0
              ? Math.min(100, Math.round((item.consumed / item.target) * 100))
              : 0;
          return (
            <div key={item.label} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span
                  className="text-base-content/60"
                  data-testid="nutrition-value">
                  {item.consumed}/{item.target} {item.unit}
                </span>
              </div>
              <progress
                className={`progress ${
                  nutrientClasses[index % nutrientClasses.length]
                } h-2 w-full`}
                value={pct}
                max={100}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
