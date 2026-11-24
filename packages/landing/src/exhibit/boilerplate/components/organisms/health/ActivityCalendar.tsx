import type { FC } from 'react';

interface CalendarDay {
  day: string;
  level: 0 | 1 | 2 | 3;
}

interface ActivityCalendarProps {
  days: CalendarDay[];
  title?: string;
}

const levelClass: Record<CalendarDay['level'], string> = {
  0: 'bg-base-300',
  1: 'bg-primary/30',
  2: 'bg-primary/60',
  3: 'bg-primary',
};

export const ActivityCalendar: FC<ActivityCalendarProps> = ({
  days,
  title = 'Activity calendar',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-3">
      <h3 className="card-title">{title}</h3>
      <div className="grid grid-cols-7 gap-1.5" data-testid="calendar-grid">
        {days.map((day) => (
          <div key={day.day} className="flex flex-col items-center gap-1">
            <span
              className={`${levelClass[day.level]} h-8 w-full rounded-md`}
            />
            <span className="text-base-content/50 text-xs">{day.day}</span>
          </div>
        ))}
      </div>
      {days.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No activity recorded.
        </p>
      )}
    </div>
  </section>
);
