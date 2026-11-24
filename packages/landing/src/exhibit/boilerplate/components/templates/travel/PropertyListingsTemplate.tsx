'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiDroplet,
  FiGrid,
  FiHeart,
  FiHome,
  FiMapPin,
  FiMaximize,
} from 'react-icons/fi';

type PropertyStatus = 'For Sale' | 'Sold';

interface Property {
  id: string;
  title: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  location: string;
  status: PropertyStatus;
}

const PROPERTIES: Property[] = [
  {
    id: 'p1',
    title: 'Maple Grove Family Home',
    price: '$845,000',
    beds: 4,
    baths: 3,
    sqft: 2400,
    location: 'Maple Grove',
    status: 'For Sale',
  },
  {
    id: 'p2',
    title: 'Riverside Condo',
    price: '$520,000',
    beds: 2,
    baths: 2,
    sqft: 1100,
    location: 'Riverside',
    status: 'For Sale',
  },
  {
    id: 'p3',
    title: 'Downtown Penthouse',
    price: '$1,280,000',
    beds: 3,
    baths: 3,
    sqft: 2050,
    location: 'Downtown',
    status: 'For Sale',
  },
  {
    id: 'p4',
    title: 'Lakeside Cottage',
    price: '$390,000',
    beds: 2,
    baths: 1,
    sqft: 950,
    location: 'Lakeview',
    status: 'For Sale',
  },
  {
    id: 'p5',
    title: 'Birchwood Estate',
    price: '$1,950,000',
    beds: 6,
    baths: 5,
    sqft: 4800,
    location: 'Birchwood Hills',
    status: 'Sold',
  },
  {
    id: 'p6',
    title: 'Sunset Terrace Townhome',
    price: '$610,000',
    beds: 3,
    baths: 2,
    sqft: 1600,
    location: 'Sunset Terrace',
    status: 'For Sale',
  },
];

export const PropertyListingsTemplate: FC = () => {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Property Listings</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Browse homes for sale.
        </p>
      </header>
      <main className="mx-auto w-full max-w-5xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">6 properties</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTIES.map((property) => {
            const isSaved = savedIds.includes(property.id);
            return (
              <div
                key={property.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <FiHome className="text-base-content/30 h-6 w-6 shrink-0" />
                    <span
                      className={`badge badge-sm ${
                        property.status === 'For Sale'
                          ? 'badge-success'
                          : 'badge-neutral'
                      }`}>
                      {property.status}
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
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <FiGrid className="text-base-content/50 h-3 w-3" />
                      {property.beds} beds
                    </span>
                    <span className="flex items-center gap-1">
                      <FiDroplet className="text-base-content/50 h-3 w-3" />
                      {property.baths} baths
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMaximize className="text-base-content/50 h-3 w-3" />
                      {property.sqft.toLocaleString()} sqft
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSaved && (
                      <span className="badge badge-success badge-sm">
                        Saved
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleSave(property.id)}
                      className="btn btn-primary btn-sm gap-1">
                      <FiHeart />
                      Save
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

PropertyListingsTemplate.displayName = 'PropertyListingsTemplate';
