'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiHome, FiNavigation, FiSearch, FiStar } from 'react-icons/fi';

type BookingTab = 'Hotels' | 'Flights';

interface Hotel {
  id: string;
  name: string;
  city: string;
  price: number;
  rating: number;
}

interface Flight {
  id: string;
  airline: string;
  route: string;
  price: number;
}

const HOTELS: Hotel[] = [
  { id: 'h1', name: 'Hotel Sunset', city: 'Hanoi', price: 120, rating: 4.5 },
  {
    id: 'h2',
    name: 'Sea Breeze Resort',
    city: 'Da Nang',
    price: 180,
    rating: 4.7,
  },
  {
    id: 'h3',
    name: 'Golden Lotus Inn',
    city: 'Hoi An',
    price: 85,
    rating: 4.3,
  },
  {
    id: 'h4',
    name: 'City Lights Hotel',
    city: 'Ho Chi Minh City',
    price: 150,
    rating: 4.6,
  },
];

const FLIGHTS: Flight[] = [
  {
    id: 'f1',
    airline: 'Vietnam Airlines',
    route: 'Hanoi → Tokyo',
    price: 520,
  },
  {
    id: 'f2',
    airline: 'AirAsia',
    route: 'Ho Chi Minh City → Bangkok',
    price: 180,
  },
  { id: 'f3', airline: 'Vietjet Air', route: 'Da Nang → Seoul', price: 260 },
];

const TABS: BookingTab[] = ['Hotels', 'Flights'];

const HotelResults = ({ hotels }: { hotels: Hotel[] }) => (
  <div className="card bg-base-200 border-base-content/10 border">
    <div className="card-body p-0">
      {hotels.map((hotel) => (
        <div
          key={hotel.id}
          className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
          <FiHome className="text-base-content/30 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{hotel.name}</p>
            <p className="text-base-content/50 text-xs">{hotel.city}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-medium">${hotel.price}/night</span>
            <span className="text-base-content/50 flex items-center gap-1 text-xs">
              <FiStar className="h-3 w-3" />
              {hotel.rating} rating
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FlightResults = ({ flights }: { flights: Flight[] }) => (
  <div className="card bg-base-200 border-base-content/10 border">
    <div className="card-body p-0">
      {flights.map((flight) => (
        <div
          key={flight.id}
          className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
          <FiNavigation className="text-base-content/30 h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{flight.airline}</p>
            <p className="text-base-content/50 text-xs">{flight.route}</p>
          </div>
          <span className="text-xs font-medium">${flight.price}</span>
        </div>
      ))}
    </div>
  </div>
);

const EmptyResults = ({ query }: { query: string }) => (
  <div className="card bg-base-200 border-base-content/10 border">
    <div className="card-body items-center gap-2 p-10 text-center">
      <FiSearch className="text-base-content/20 h-8 w-8" />
      <p className="text-base-content/50 text-sm">
        No results for &quot;{query.trim()}&quot;
      </p>
    </div>
  </div>
);

export const BookingSearchTemplate: FC = () => {
  const [tab, setTab] = useState<BookingTab>('Hotels');
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();
  const hotels = normalized
    ? HOTELS.filter(
        (hotel) =>
          hotel.name.toLowerCase().includes(normalized) ||
          hotel.city.toLowerCase().includes(normalized)
      )
    : HOTELS;
  const flights = normalized
    ? FLIGHTS.filter(
        (flight) =>
          flight.airline.toLowerCase().includes(normalized) ||
          flight.route.toLowerCase().includes(normalized)
      )
    : FLIGHTS;
  const count = tab === 'Hotels' ? hotels.length : flights.length;

  const renderResults = () => {
    if (count === 0) return <EmptyResults query={query} />;
    if (tab === 'Hotels') return <HotelResults hotels={hotels} />;
    return <FlightResults flights={flights} />;
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Booking Search</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Find hotels and flights.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="relative mb-4">
          <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search hotels or flights..."
            aria-label="Search bookings"
            className="input input-bordered w-full pl-9"
          />
        </div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {TABS.map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`tab ${tab === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">{count} results</p>
        </div>

        {renderResults()}
      </main>
    </div>
  );
};

BookingSearchTemplate.displayName = 'BookingSearchTemplate';
