import type { FC } from 'react';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionalSummaryProps {
  nutrition: NutritionData;
  targetCalories?: number;
  title?: string;
}

export const NutritionalSummary: FC<NutritionalSummaryProps> = ({
  nutrition,
  targetCalories = 2000,
  title = 'Nutritional summary',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="card-title">{title}</h3>
        <span className="badge badge-ghost">{nutrition.calories} kcal</span>
      </div>
      <div className="bg-base-100 rounded-xl p-4 text-center">
        <p className="text-3xl font-light" data-testid="calories">
          {nutrition.calories}
        </p>
        <p className="text-base-content/50 text-xs">
          of {targetCalories} kcal target
        </p>
        <progress
          className="progress progress-primary mt-2 w-full"
          value={Math.min(nutrition.calories, targetCalories)}
          max={targetCalories}
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(['protein', 'carbs', 'fat'] as const).map((macro) => (
          <div key={macro} className="bg-base-100 rounded-xl p-3 text-center">
            <p className="text-lg font-medium">{nutrition[macro]}g</p>
            <p className="text-base-content/50 text-xs capitalize">{macro}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
