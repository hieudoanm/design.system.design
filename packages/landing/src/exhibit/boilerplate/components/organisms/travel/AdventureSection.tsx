import type { FC } from 'react';

interface Activity {
  id: string;
  name: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  price: number;
  duration: string;
  rating: number;
}

interface AdventureSectionProps {
  activities: Activity[];
}

const DIFFICULTY_BADGE: Record<Activity['difficulty'], string> = {
  easy: 'badge-success',
  moderate: 'badge-warning',
  hard: 'badge-error',
};

export const AdventureSection: FC<AdventureSectionProps> = ({ activities }) => {
  return (
    <section data-testid="adventure-section" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Adventures</h2>
        <button type="button" className="btn btn-ghost btn-sm">
          See all
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <article key={activity.id} className="card bg-base-200">
            <figure className="bg-secondary/20 flex aspect-[4/3] items-center justify-center">
              <span
                className="text-base-content/30 text-4xl"
                aria-hidden="true">
                &#9878;
              </span>
              <span className="badge badge-primary absolute top-2 right-2">
                {activity.rating} &#9733;
              </span>
            </figure>
            <div className="card-body gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-medium">{activity.name}</h3>
                <span
                  className={`badge badge-sm ${DIFFICULTY_BADGE[activity.difficulty]}`}>
                  {activity.difficulty}
                </span>
              </div>
              <p className="text-base-content/50 text-xs">
                {activity.duration}
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-lg font-semibold">
                  ${activity.price.toLocaleString()}
                </span>
                <button type="button" className="btn btn-primary btn-sm">
                  Book
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
