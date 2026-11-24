'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiHeart, FiMapPin, FiStar } from 'react-icons/fi';

type Region = 'All' | 'Europe' | 'Asia' | 'Americas';

interface Destination {
  id: string;
  city: string;
  country: string;
  region: Exclude<Region, 'All'>;
  price: number;
  rating: number;
  saved: boolean;
}

const DESTINATIONS: Destination[] = [
  {
    id: 'd1',
    city: 'Paris',
    country: 'France',
    region: 'Europe',
    price: 840,
    rating: 4.8,
    saved: false,
  },
  {
    id: 'd2',
    city: 'Barcelona',
    country: 'Spain',
    region: 'Europe',
    price: 720,
    rating: 4.6,
    saved: false,
  },
  {
    id: 'd3',
    city: 'Lisbon',
    country: 'Portugal',
    region: 'Europe',
    price: 560,
    rating: 4.5,
    saved: false,
  },
  {
    id: 'd4',
    city: 'Hanoi',
    country: 'Vietnam',
    region: 'Asia',
    price: 680,
    rating: 4.9,
    saved: false,
  },
  {
    id: 'd5',
    city: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    price: 920,
    rating: 4.7,
    saved: false,
  },
  {
    id: 'd6',
    city: 'Singapore',
    country: 'Singapore',
    region: 'Asia',
    price: 1040,
    rating: 4.5,
    saved: false,
  },
  {
    id: 'd7',
    city: 'New York',
    country: 'USA',
    region: 'Americas',
    price: 1100,
    rating: 4.6,
    saved: false,
  },
  {
    id: 'd8',
    city: 'Cartagena',
    country: 'Colombia',
    region: 'Americas',
    price: 640,
    rating: 4.7,
    saved: false,
  },
  {
    id: 'd9',
    city: 'Cusco',
    country: 'Peru',
    region: 'Americas',
    price: 580,
    rating: 4.4,
    saved: false,
  },
];

const REGIONS: Region[] = ['All', 'Europe', 'Asia', 'Americas'];

export const DestinationsTemplate: FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>(DESTINATIONS);
  const [region, setRegion] = useState<Region>('All');

  const filtered =
    region === 'All'
      ? destinations
      : destinations.filter((destination) => destination.region === region);

  const toggleSave = (id: string) => {
    setDestinations((prev) =>
      prev.map((destination) =>
        destination.id === id
          ? { ...destination, saved: !destination.saved }
          : destination
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Destinations</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Find your next trip.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {REGIONS.map((item) => (
              <button
                key={item}
                onClick={() => setRegion(item)}
                className={`tab ${region === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">
            {filtered.length} destinations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((destination) => (
            <div
              key={destination.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-base-content/30 h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{destination.city}</p>
                      <p className="text-base-content/50 text-xs">
                        {destination.country}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {destination.saved && (
                      <span className="badge badge-success badge-sm">
                        Saved
                      </span>
                    )}
                    <button
                      onClick={() => toggleSave(destination.id)}
                      className="btn btn-primary btn-sm gap-1">
                      <FiHeart />
                      Save
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base-content/50 flex items-center gap-1 text-xs">
                    <FiStar className="h-3.5 w-3.5" />
                    {destination.rating} rating
                  </p>
                  <p className="text-sm font-medium">
                    from ${destination.price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

DestinationsTemplate.displayName = 'DestinationsTemplate';
