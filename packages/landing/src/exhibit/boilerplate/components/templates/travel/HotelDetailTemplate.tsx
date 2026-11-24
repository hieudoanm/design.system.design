'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheckCircle, FiHeart, FiMapPin, FiStar } from 'react-icons/fi';

const HOTEL = {
  name: 'Hotel Sunset',
  city: 'Hanoi, Vietnam',
  rating: 4.6,
  price: 120,
  amenities: ['Free WiFi', 'Pool', 'Gym', 'Breakfast'],
};

export const HotelDetailTemplate: FC = () => {
  const [booked, setBooked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Hotel</h1>
        <p className="text-base-content/50 mt-1 text-sm">Hotel details.</p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold tracking-tight">{HOTEL.name}</p>
                <p className="text-base-content/50 flex items-center gap-1 text-sm">
                  <FiMapPin className="h-3.5 w-3.5" />
                  {HOTEL.city}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {booked && (
                  <span className="badge badge-success badge-sm">Booked</span>
                )}
                {favorited && (
                  <span className="badge badge-error badge-sm">Favorited</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-base-content/50 flex items-center gap-1 text-sm">
                <FiStar className="h-3.5 w-3.5" />
                {HOTEL.rating} rating
              </p>
              <p className="text-lg font-bold tracking-tight">
                ${HOTEL.price}/night
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {HOTEL.amenities.map((amenity) => (
                <span key={amenity} className="badge badge-info badge-sm gap-1">
                  <FiCheckCircle className="h-3 w-3" />
                  {amenity}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setBooked((prev) => !prev)}
                className="btn btn-primary btn-sm gap-1">
                <FiCheckCircle />
                Book
              </button>
              <button
                onClick={() => setFavorited((prev) => !prev)}
                className="btn btn-ghost btn-sm gap-1">
                <FiHeart />
                Favorite
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

HotelDetailTemplate.displayName = 'HotelDetailTemplate';
