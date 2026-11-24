'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiActivity, FiDatabase, FiSliders, FiUsers } from 'react-icons/fi';

type ActivityType = 'user' | 'system' | 'admin';
type ActivityFilter = 'all' | ActivityType;

interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: string;
  action: string;
  time: string;
}

const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'a1',
    type: 'user',
    actor: 'Alice Chen',
    action: 'created the project "Alpha"',
    time: '2 min ago',
  },
  {
    id: 'a2',
    type: 'admin',
    actor: 'Ops Team',
    action: 'updated security policies',
    time: '18 min ago',
  },
  {
    id: 'a3',
    type: 'system',
    actor: 'System',
    action: 'ran an automated backup',
    time: '1 hr ago',
  },
  {
    id: 'a4',
    type: 'user',
    actor: 'Bob Martinez',
    action: 'deployed v3.2.1 to production',
    time: '3 hrs ago',
  },
  {
    id: 'a5',
    type: 'admin',
    actor: 'Ops Team',
    action: 'invited 3 new members',
    time: '6 hrs ago',
  },
];

const MORE_ACTIVITIES: ActivityItem[] = [
  {
    id: 'a6',
    type: 'system',
    actor: 'System',
    action: 'rotated API keys',
    time: '1 day ago',
  },
  {
    id: 'a7',
    type: 'user',
    actor: 'Carol Smith',
    action: 'updated billing details',
    time: '2 days ago',
  },
  {
    id: 'a8',
    type: 'admin',
    actor: 'Ops Team',
    action: 'changed the plan to Pro',
    time: '3 days ago',
  },
  {
    id: 'a9',
    type: 'user',
    actor: 'David Kim',
    action: 'archived the project "Beta"',
    time: '5 days ago',
  },
];

const ALL_ACTIVITIES: ActivityItem[] = [
  ...INITIAL_ACTIVITIES,
  ...MORE_ACTIVITIES,
];

const getTypeIcon = (type: ActivityType) => {
  switch (type) {
    case 'user':
      return <FiUsers className="h-4 w-4" />;
    case 'admin':
      return <FiSliders className="h-4 w-4" />;
    default:
      return <FiDatabase className="h-4 w-4" />;
  }
};

export const ActivityLogTemplate: FC = () => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_ACTIVITIES.length);
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const filtered = ALL_ACTIVITIES.filter(
    (item) => filter === 'all' || item.type === filter
  );
  const visible = filtered.slice(0, visibleCount);
  const allShown = visibleCount >= filtered.length;

  const loadMore = () => setVisibleCount((count) => count + 2);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Activity log</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Review every change made in your workspace.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-6 flex justify-end">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActivityFilter)}
            className="select select-bordered select-sm">
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="system">System</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex flex-col">
          {visible.map((item) => (
            <div key={item.id} className="relative flex gap-4 pb-6 pl-12">
              <span className="bg-base-200 border-base-content/10 absolute top-0 left-0 flex h-8 w-8 items-center justify-center rounded-full border">
                {getTypeIcon(item.type)}
              </span>
              <div>
                <p className="text-sm">
                  <span className="font-semibold">{item.actor}</span>{' '}
                  {item.action}
                </p>
                <p className="text-base-content/40 text-xs">{item.time}</p>
              </div>
            </div>
          ))}
        </div>

        {allShown ? (
          <p className="text-base-content/50 pt-2 text-center text-sm">
            End of activity
          </p>
        ) : (
          <button
            onClick={loadMore}
            className="btn btn-outline btn-sm mt-4 w-full">
            <FiActivity />
            Load more
          </button>
        )}
      </main>
    </div>
  );
};

ActivityLogTemplate.displayName = 'ActivityLogTemplate';
