import type { FC, ReactNode } from 'react';

interface TimelineItem {
  title: string;
  description?: string;
  time?: string;
  icon?: ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: FC<TimelineProps> = ({ items }) => (
  <ul className="timeline timeline-vertical w-full">
    {items.map((item, index) => (
      <li key={item.title}>
        {index > 0 && <hr />}
        <div className="timeline-middle">
          <span className="bg-base-content/10 border-base-200 flex h-6 w-6 items-center justify-center rounded-full border text-xs">
            {item.icon ?? index + 1}
          </span>
        </div>
        <div
          className={`timeline-${index % 2 === 0 ? 'start' : 'end'} ${
            index % 2 === 0 ? 'mr-4' : 'ml-4'
          } mb-6`}>
          <time className="text-base-content/50 text-xs">{item.time}</time>
          <p className="mt-1 text-sm font-medium">{item.title}</p>
          {item.description && (
            <p className="text-base-content/50 text-sm">{item.description}</p>
          )}
        </div>
        {index < items.length - 1 && <hr />}
      </li>
    ))}
  </ul>
);
