'use client';

import type { FC } from 'react';
import { useState } from 'react';

type AnnouncementType = 'Update' | 'Maintenance' | 'New feature';
type TypeFilter = 'All' | AnnouncementType;

interface Announcement {
  id: string;
  title: string;
  date: string;
  type: AnnouncementType;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'an1',
    title: 'Dark mode is here',
    date: 'Aug 1, 2026',
    type: 'New feature',
  },
  {
    id: 'an2',
    title: 'Scheduled maintenance on August 9',
    date: 'Aug 5, 2026',
    type: 'Maintenance',
  },
  {
    id: 'an3',
    title: 'Improved search performance',
    date: 'Jul 28, 2026',
    type: 'Update',
  },
  {
    id: 'an4',
    title: 'New keyboard shortcuts',
    date: 'Jul 21, 2026',
    type: 'New feature',
  },
  {
    id: 'an5',
    title: 'Payment processing upgrade',
    date: 'Jul 15, 2026',
    type: 'Maintenance',
  },
];

const FILTERS: TypeFilter[] = ['All', 'Update', 'Maintenance', 'New feature'];

const getTypeBadge = (type: AnnouncementType) => {
  switch (type) {
    case 'Maintenance':
      return <span className="badge badge-warning badge-sm">Maintenance</span>;
    case 'New feature':
      return <span className="badge badge-success badge-sm">New feature</span>;
    default:
      return <span className="badge badge-info badge-sm">Update</span>;
  }
};

export const AnnouncementsTemplate: FC = () => {
  const [filter, setFilter] = useState<TypeFilter>('All');

  const visible = ANNOUNCEMENTS.filter(
    (announcement) => filter === 'All' || announcement.type === filter
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Product updates and service notices.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`tab ${filter === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">
            {visible.length} announcements
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {visible.map((announcement) => (
            <div
              key={announcement.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold">
                    {announcement.title}
                  </h2>
                  {getTypeBadge(announcement.type)}
                </div>
                <p className="text-base-content/50 text-xs">
                  {announcement.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

AnnouncementsTemplate.displayName = 'AnnouncementsTemplate';
