'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock, FiMapPin } from 'react-icons/fi';

interface OpenHouse {
  id: string;
  property: string;
  dateTime: string;
  address: string;
}

const OPEN_HOUSES: OpenHouse[] = [
  {
    id: 'o1',
    property: 'Maple Grove Family Home',
    dateTime: 'Sat, Aug 15 · 10:00 AM - 12:00 PM',
    address: '12 Maple Lane, Maple Grove',
  },
  {
    id: 'o2',
    property: 'Riverside Condo',
    dateTime: 'Sat, Aug 15 · 1:00 PM - 3:00 PM',
    address: '88 River Road, Riverside',
  },
  {
    id: 'o3',
    property: 'Downtown Penthouse',
    dateTime: 'Sun, Aug 16 · 11:00 AM - 1:00 PM',
    address: '400 Main Street, Downtown',
  },
  {
    id: 'o4',
    property: 'Lakeside Cottage',
    dateTime: 'Sun, Aug 16 · 2:00 PM - 4:00 PM',
    address: '7 Lakeview Drive, Lakeview',
  },
  {
    id: 'o5',
    property: 'Sunset Terrace Townhome',
    dateTime: 'Sat, Aug 22 · 10:00 AM - 12:00 PM',
    address: '15 Terrace Way, Sunset Terrace',
  },
];

export const OpenHousesTemplate: FC = () => {
  const [added, setAdded] = useState<string[]>([]);

  const toggleAdded = (id: string) => {
    setAdded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Open Houses</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Tour homes this week.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          5 open houses this week
        </p>
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {OPEN_HOUSES.map((event) => {
              const isAdded = added.includes(event.id);
              return (
                <div
                  key={event.id}
                  className="border-base-content/10 flex flex-col gap-3 border-b p-4 last:border-b-0 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{event.property}</p>
                    <p className="text-base-content/50 mt-1 flex items-center gap-1 text-xs">
                      <FiClock className="h-3 w-3" />
                      {event.dateTime}
                    </p>
                    <p className="text-base-content/50 mt-1 flex items-center gap-1 text-xs">
                      <FiMapPin className="h-3 w-3" />
                      {event.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdded && (
                      <span className="badge badge-success badge-sm">
                        Added
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleAdded(event.id)}
                      className="btn btn-primary btn-sm">
                      Add to calendar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

OpenHousesTemplate.displayName = 'OpenHousesTemplate';
