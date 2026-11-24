import type { FC } from 'react';

interface Recipe {
  id: string;
  name: string;
  description?: string;
  time?: string;
  difficulty?: string;
  servings?: number;
}

interface RecipeCollectionProps {
  recipes: Recipe[];
  title?: string;
}

export const RecipeCollection: FC<RecipeCollectionProps> = ({
  recipes,
  title = 'Featured recipes',
}) => (
  <section className="py-6">
    <h2 className="mb-4 text-xl">{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <article
          key={recipe.id}
          className="card bg-base-200 border-base-content/10 overflow-hidden rounded-xl border">
          <div className="from-accent to-primary h-32 w-full bg-gradient-to-br" />
          <div className="card-body">
            <h3 className="card-title text-base">{recipe.name}</h3>
            {recipe.description && (
              <p className="text-base-content/50 text-sm">
                {recipe.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs">
              {recipe.time && (
                <span className="badge badge-ghost badge-sm">
                  {recipe.time}
                </span>
              )}
              {recipe.difficulty && (
                <span className="badge badge-ghost badge-sm">
                  {recipe.difficulty}
                </span>
              )}
              {recipe.servings !== undefined && (
                <span className="badge badge-ghost badge-sm">
                  Serves {recipe.servings}
                </span>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);
