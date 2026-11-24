import type { FC, ReactNode } from 'react';

interface EventTimelineItem {
  id: string;
  title: string;
  date: string;
  description?: string;
  status?: 'neutral' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
}

interface EventTimelineProps {
  items: EventTimelineItem[];
  title?: string;
}

const STATUS_DOT: Record<NonNullable<EventTimelineItem['status']>, string> = {
  neutral: 'bg-base-content/30',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

export const EventTimeline: FC<EventTimelineProps> = ({ items, title }) => (
  <div className="flex w-full flex-col gap-3">
    {title && <h3 className="text-sm font-semibold">{title}</h3>}
    <ol className="relative ml-3 flex flex-col gap-6 border-l">
      {items.map((item) => (
        <li key={item.id} className="relative pl-6">
          <span
            aria-hidden="true"
            className={`absolute top-1 -left-[5px] h-2.5 w-2.5 rounded-full ${STATUS_DOT[item.status ?? 'neutral']}`}
          />
          {item.icon && (
            <span className="text-base-content/40 absolute top-0 -left-3 text-base">
              {item.icon}
            </span>
          )}
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{item.title}</p>
              <time className="text-base-content/50 text-xs">{item.date}</time>
            </div>
            {item.description && (
              <p className="text-base-content/50 text-sm">{item.description}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  </div>
);
