import type { FC } from 'react';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  actor: string;
}

interface ActivityLogProps {
  activities: Activity[];
}

export const ActivityLog: FC<ActivityLogProps> = ({ activities }) => (
  <section data-testid="activity-log" className="flex flex-col gap-3">
    <h3 className="text-lg font-medium">Activity</h3>
    {activities.length === 0 ? (
      <p className="text-base-content/40 text-sm">No activity yet</p>
    ) : (
      <ul className="flex flex-col gap-3">
        {activities.map((activity) => (
          <li key={activity.id} className="flex items-start gap-3">
            <span className="badge badge-ghost badge-sm mt-1">
              {activity.type}
            </span>
            <div>
              <p className="text-sm">{activity.description}</p>
              <p className="text-base-content/50 text-xs">
                {activity.actor} · {activity.timestamp}
              </p>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

ActivityLog.displayName = 'ActivityLog';
