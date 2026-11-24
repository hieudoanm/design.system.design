'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCalendar, FiClock, FiHeart, FiMapPin, FiStar } from 'react-icons/fi';

const NAME = 'Trattoria Fiore';
const CUISINE = 'Italian';
const RATING = 4.5;
const ADDRESS = '12 Harbor Street';
const HOURS = ['Mon-Fri: 11:00 - 22:00', 'Sat-Sun: 12:00 - 23:00'];

export const RestaurantDetailTemplate: FC = () => {
  const [booked, setBooked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Restaurant</h1>
        <p className="text-base-content/50 mt-1 text-sm">Restaurant details.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <article className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold tracking-tight">{NAME}</h2>
              <span className="badge badge-info badge-sm">{CUISINE}</span>
            </div>

            <p className="text-base-content/50 flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <FiStar className="h-3.5 w-3.5" />
                {RATING} rating
              </span>
              <span className="flex items-center gap-1">
                <FiMapPin className="h-3.5 w-3.5" />
                {ADDRESS}
              </span>
            </p>

            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2 text-sm font-medium">
                <FiClock className="h-3.5 w-3.5" />
                Opening hours
              </p>
              <ul className="text-base-content/50 text-sm">
                {HOURS.map((hours) => (
                  <li key={hours}>{hours}</li>
                ))}
              </ul>
            </div>

            <div className="border-base-content/10 mt-2 flex flex-wrap items-center gap-3 border-t pt-4">
              {booked ? (
                <span className="badge badge-success badge-sm">Booked</span>
              ) : (
                <button
                  onClick={() => setBooked(true)}
                  className="btn btn-primary btn-sm gap-1">
                  <FiCalendar className="h-4 w-4" />
                  Book table
                </button>
              )}
              {favorited ? (
                <span className="badge badge-error badge-sm">Favorited</span>
              ) : (
                <button
                  onClick={() => setFavorited(true)}
                  className="btn btn-outline btn-sm gap-1">
                  <FiHeart className="h-4 w-4" />
                  Favorite
                </button>
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

RestaurantDetailTemplate.displayName = 'RestaurantDetailTemplate';
