'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiHeart, FiHome, FiMapPin, FiTrash2 } from 'react-icons/fi';

interface SavedProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  beds: number;
  baths: number;
}

const SAVED_PROPERTIES: SavedProperty[] = [
  {
    id: 's1',
    title: 'Maple Grove Family Home',
    location: 'Maple Grove',
    price: '$845,000',
    beds: 4,
    baths: 3,
  },
  {
    id: 's2',
    title: 'Riverside Condo',
    location: 'Riverside',
    price: '$520,000',
    beds: 2,
    baths: 2,
  },
  {
    id: 's3',
    title: 'Downtown Penthouse',
    location: 'Downtown',
    price: '$1,280,000',
    beds: 3,
    baths: 3,
  },
  {
    id: 's4',
    title: 'Lakeside Cottage',
    location: 'Lakeview',
    price: '$390,000',
    beds: 2,
    baths: 1,
  },
];

export const SavedPropertiesTemplate: FC = () => {
  const [saved, setSaved] = useState<SavedProperty[]>(SAVED_PROPERTIES);

  const removeSaved = (id: string) => {
    setSaved((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Saved Properties</h1>
        <p className="text-base-content/50 mt-1 text-sm">Your shortlist.</p>
      </header>
      <main className="mx-auto w-full max-w-5xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {saved.length} saved properties
        </p>
        {saved.length === 0 ? (
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body items-center gap-2 p-10 text-center">
              <FiHeart className="text-base-content/20 h-8 w-8" />
              <p className="text-base-content/50 text-sm">
                No saved properties yet
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {saved.map((property) => (
              <div
                key={property.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <FiHome className="text-base-content/30 h-6 w-6 shrink-0" />
                    <span className="badge badge-ghost badge-sm">
                      <FiHeart className="mr-1 h-3 w-3" />
                      Saved
                    </span>
                  </div>
                  <p className="text-sm font-medium">{property.title}</p>
                  <p className="text-2xl font-bold tracking-tight">
                    {property.price}
                  </p>
                  <p className="text-base-content/50 flex items-center gap-1 text-xs">
                    <FiMapPin className="h-3 w-3" />
                    {property.location}
                  </p>
                  <p className="text-base-content/50 text-xs">
                    {property.beds} beds · {property.baths} baths
                  </p>
                  <button
                    type="button"
                    onClick={() => removeSaved(property.id)}
                    className="btn btn-error btn-outline btn-sm gap-1">
                    <FiTrash2 />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

SavedPropertiesTemplate.displayName = 'SavedPropertiesTemplate';
