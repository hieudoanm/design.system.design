import type { FC } from 'react';

interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  category?: string;
}

interface EventsSectionProps {
  events: EventItem[];
  onAttend?: (id: string) => void;
}

export const EventsSection: FC<EventsSectionProps> = ({ events, onAttend }) => {
  if (events.length === 0) {
    return (
      <section data-testid="events-section" className="card bg-base-200">
        <div className="card-body items-center text-center">
          <p className="text-base-content/60">No upcoming events</p>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="events-section" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Upcoming events</h2>
      </div>
      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <article
            key={event.id}
            className="card card-side bg-base-200 flex-col sm:flex-row">
            <div className="bg-primary/20 flex flex-col items-center justify-center px-6 py-3 text-center">
              <span className="text-xs uppercase opacity-70">Date</span>
              <span className="text-lg font-medium">{event.date}</span>
            </div>
            <div className="card-body gap-2 py-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium">{event.title}</h3>
                {event.category && (
                  <span className="badge badge-ghost">{event.category}</span>
                )}
              </div>
              <p className="text-base-content/50 text-xs">
                {event.location} &middot; {event.attendees.toLocaleString()}{' '}
                attending
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm w-fit"
                onClick={() => onAttend?.(event.id)}>
                Attend
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
