import type { FC } from 'react';

interface TripDetails {
  destination: string;
  dates: string;
  travelers: number;
  budget: number;
}

interface PlannedActivity {
  id: string;
  name: string;
  date: string;
  confirmed?: boolean;
}

interface TripPlannerProps {
  trip: TripDetails;
  activities: PlannedActivity[];
}

export const TripPlanner: FC<TripPlannerProps> = ({ trip, activities }) => {
  const confirmed = activities.filter((activity) => activity.confirmed).length;

  return (
    <section data-testid="trip-planner" className="flex flex-col gap-4">
      <div className="hero bg-primary text-primary-content rounded-2xl">
        <div className="hero-content flex-col py-8 text-center">
          <p className="badge badge-ghost">{trip.dates}</p>
          <h1 className="text-2xl font-medium">{trip.destination}</h1>
          <p className="text-sm opacity-80">
            {trip.travelers} traveler{trip.travelers > 1 ? 's' : ''} &middot;
            budget ${trip.budget.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="stats w-full shadow">
        <div className="stat">
          <div className="stat-title">Planned</div>
          <div className="stat-value text-lg">{activities.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Confirmed</div>
          <div className="stat-value text-lg">{confirmed}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Activities</h2>
          <button type="button" className="btn btn-primary btn-sm">
            Add activity
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {activities.length === 0 && (
            <li className="text-base-content/60 text-sm">
              No activities planned yet
            </li>
          )}
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="card bg-base-200 flex-row items-center gap-3">
              <div className="card-body flex-row items-center gap-3 p-3">
                <span className="badge badge-ghost">{activity.date}</span>
                <span className="text-sm font-medium">{activity.name}</span>
                <span
                  className={`badge ml-auto ${
                    activity.confirmed ? 'badge-success' : 'badge-ghost'
                  }`}>
                  {activity.confirmed ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
