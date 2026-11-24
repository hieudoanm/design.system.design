import type { FC } from 'react';

interface DayActivity {
  id: string;
  time: string;
  name: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  description?: string;
  activities: DayActivity[];
}

interface ItineraryViewProps {
  title: string;
  dates: string;
  days: ItineraryDay[];
}

export const ItineraryView: FC<ItineraryViewProps> = ({
  title,
  dates,
  days,
}) => {
  return (
    <section data-testid="itinerary-view" className="flex flex-col gap-4">
      <header className="card bg-base-200">
        <div className="card-body gap-1 p-4">
          <h2 className="text-lg font-medium">{title}</h2>
          <p className="text-base-content/50 text-sm">{dates}</p>
        </div>
      </header>
      <div className="flex flex-col gap-3">
        {days.map((day) => (
          <article key={day.day} className="card bg-base-200">
            <div className="card-body gap-2 p-4">
              <div className="flex items-center gap-3">
                <span className="badge badge-primary">Day {day.day}</span>
                <h3 className="text-sm font-medium">{day.title}</h3>
              </div>
              {day.description && (
                <p className="text-base-content/60 text-sm">
                  {day.description}
                </p>
              )}
              <ul className="flex flex-col gap-1">
                {day.activities.map((activity) => (
                  <li
                    key={activity.id}
                    className="flex items-center gap-2 text-sm">
                    <span className="text-base-content/50 w-14">
                      {activity.time}
                    </span>
                    <span>{activity.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
