import type { FC } from 'react';

interface EventCardProps {
  title: string;
  date: string;
  location?: string;
  attendees?: number;
  price?: string;
  month?: string;
  day?: number;
}

export const EventCard: FC<EventCardProps> = ({
  title,
  date,
  location,
  attendees = 0,
  price,
  month,
  day,
}) => (
  <article
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="event-card">
    <div className="card-body gap-2">
      <div className="flex items-start gap-3">
        {month && day !== undefined && (
          <div className="bg-primary/10 flex w-12 shrink-0 flex-col items-center rounded-lg py-1">
            <span className="text-primary text-xs uppercase">{month}</span>
            <span className="text-lg font-bold">{day}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="card-title text-base">{title}</h3>
          <p className="text-base-content/60 text-sm">{date}</p>
          {location && (
            <p className="text-base-content/60 text-sm">{location}</p>
          )}
        </div>
      </div>
      <footer className="text-base-content/50 flex items-center justify-between text-xs">
        <span>{attendees} attending</span>
        {price && <span>{price}</span>}
      </footer>
    </div>
  </article>
);
