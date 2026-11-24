import type { FC, ReactNode } from 'react';

interface FeedItem {
  id: string;
  title: string;
  description?: string;
  time?: string;
  icon?: ReactNode;
  status?: 'neutral' | 'success' | 'warning' | 'error';
}

interface ActivityFeedProps {
  items: FeedItem[];
  title?: string;
}

const statusDot: Record<NonNullable<FeedItem['status']>, string> = {
  neutral: 'bg-base-content/30',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

export const ActivityFeed: FC<ActivityFeedProps> = ({ items, title }) => (
  <div className="bg-base-200 border-base-content/10 w-full rounded-xl border p-4">
    {title && <h3 className="mb-4 text-sm font-medium">{title}</h3>}
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            {item.icon ? (
              <div className="text-base-content/60 bg-base-300 flex h-8 w-8 items-center justify-center rounded-full">
                {item.icon}
              </div>
            ) : (
              <span
                className={`mt-2 h-2 w-2 rounded-full ${statusDot[item.status ?? 'neutral']}`}
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">{item.title}</p>
            {item.description && (
              <p className="text-base-content/50 text-xs">{item.description}</p>
            )}
            {item.time && (
              <p className="text-base-content/40 mt-0.5 text-xs">{item.time}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
);
