'use client';

import type { FC } from 'react';

interface Activity {
  id: string;
  title: string;
  description?: string;
  time?: string;
}

interface RecentActivityProps {
  activities: Activity[];
  onViewAll?: () => void;
  emptyText?: string;
}

export const RecentActivity: FC<RecentActivityProps> = ({
  activities,
  onViewAll,
  emptyText = 'No recent activity.',
}) => (
  <section className="card bg-base-100 border-base-200 border shadow-sm">
    <div className="card-body">
      <div className="flex items-center justify-between">
        <h3 className="card-title text-base">Recent activity</h3>
        {onViewAll && (
          <button
            type="button"
            data-testid="activity-view-all"
            onClick={onViewAll}
            className="text-primary btn btn-ghost btn-sm">
            View all
          </button>
        )}
      </div>
      <ul className="flex flex-col gap-1">
        {activities.length === 0 && (
          <li
            data-testid="activity-empty"
            className="text-base-content/40 py-4 text-center text-sm">
            {emptyText}
          </li>
        )}
        {activities.map((activity) => (
          <li
            key={activity.id}
            data-testid={`activity-${activity.id}`}
            className="hover:bg-base-200 flex items-start gap-3 rounded-lg p-2">
            <span className="bg-primary/10 text-primary mt-1 flex h-2 w-2 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{activity.title}</p>
              {activity.description && (
                <p className="text-base-content/60 text-sm">
                  {activity.description}
                </p>
              )}
            </div>
            {activity.time && (
              <span className="text-base-content/40 text-xs">
                {activity.time}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  </section>
);
