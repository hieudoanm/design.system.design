'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiCalendar,
  FiDroplet,
  FiGrid,
  FiMapPin,
  FiMaximize,
} from 'react-icons/fi';

const PROPERTY = {
  title: 'Maple Grove Family Home',
  price: '$845,000',
  location: 'Maple Grove',
  beds: 4,
  baths: 3,
  sqft: 2400,
  yearBuilt: 2018,
  description:
    'Spacious four-bedroom family home with an updated kitchen, a private backyard, and easy access to top-rated schools.',
};

interface Feature {
  icon: typeof FiGrid;
  label: string;
  value: string;
}

const FEATURES: Feature[] = [
  { icon: FiGrid, label: 'Beds', value: '4' },
  { icon: FiDroplet, label: 'Baths', value: '3' },
  { icon: FiMaximize, label: 'Sqft', value: '2,400' },
  { icon: FiCalendar, label: 'Year Built', value: '2018' },
];

export const PropertyDetailTemplate: FC = () => {
  const [scheduled, setScheduled] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Property Detail</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          A closer look at this home.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body gap-4 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-medium">{PROPERTY.title}</p>
                <p className="text-base-content/50 flex items-center gap-1 text-xs">
                  <FiMapPin className="h-3 w-3" />
                  {PROPERTY.location}
                </p>
              </div>
              <p className="text-3xl font-bold tracking-tight">
                {PROPERTY.price}
              </p>
            </div>
            <p className="text-base-content/70 text-sm">
              {PROPERTY.description}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.label}
                    className="border-base-content/10 bg-base-100/50 flex flex-col items-center gap-1 rounded-xl border p-4">
                    <Icon className="text-base-content/50 h-4 w-4" />
                    <p className="text-sm font-medium">{feature.label}</p>
                    <p className="text-base-content/50 text-xs">
                      {feature.value}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2">
              {scheduled && (
                <span className="badge badge-success badge-sm">
                  Tour scheduled
                </span>
              )}
              <button
                type="button"
                onClick={() => setScheduled((prev) => !prev)}
                className="btn btn-primary btn-sm">
                Schedule tour
              </button>
            </div>
          </div>
        </div>

        <div className="stats stats-vertical sm:stats-horizontal w-full">
          <div className="stat">
            <p className="stat-title">Price per sqft</p>
            <p className="stat-value text-xl">$352</p>
          </div>
          <div className="stat">
            <p className="stat-title">Days on market</p>
            <p className="stat-value text-xl">28</p>
          </div>
          <div className="stat">
            <p className="stat-title">Open houses</p>
            <p className="stat-value text-xl">3 open houses this month</p>
          </div>
        </div>
      </main>
    </div>
  );
};

PropertyDetailTemplate.displayName = 'PropertyDetailTemplate';
