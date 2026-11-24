'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiAlertCircle, FiCalendar, FiCheckCircle } from 'react-icons/fi';

type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

interface Booking {
  id: string;
  title: string;
  detail: string;
  date: string;
  status: BookingStatus;
}

const BOOKINGS: Booking[] = [
  {
    id: 'b1',
    title: 'Hotel Sunset',
    detail: 'Hanoi · 2 nights',
    date: 'Aug 20, 2026',
    status: 'Confirmed',
  },
  {
    id: 'b2',
    title: 'Flight HN-TYO',
    detail: 'Hanoi → Tokyo',
    date: 'Aug 22, 2026',
    status: 'Pending',
  },
  {
    id: 'b3',
    title: 'Sea Breeze Resort',
    detail: 'Da Nang · 3 nights',
    date: 'Sep 5, 2026',
    status: 'Confirmed',
  },
  {
    id: 'b4',
    title: 'Sapa Express Bus',
    detail: 'Hanoi → Sapa',
    date: 'Sep 12, 2026',
    status: 'Pending',
  },
];

const getStatusBadge = (status: BookingStatus) => {
  if (status === 'Confirmed') {
    return (
      <span className="badge badge-success badge-sm gap-1">
        <FiCheckCircle className="h-3 w-3" />
        Confirmed
      </span>
    );
  }
  if (status === 'Pending') {
    return (
      <span className="badge badge-warning badge-sm gap-1">
        <FiAlertCircle className="h-3 w-3" />
        Pending
      </span>
    );
  }
  return <span className="badge badge-error badge-sm">Cancelled</span>;
};

export const BookingsTemplate: FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(BOOKINGS);

  const cancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, status: 'Cancelled' } : booking
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-base-content/50 mt-1 text-sm">Your reservations.</p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {bookings.length} bookings
        </p>
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
                <div className="bg-base-content/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <FiCalendar className="text-base-content/30 h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{booking.title}</p>
                  <p className="text-base-content/50 text-xs">
                    {booking.detail}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-base-content/50 text-xs">
                    {booking.date}
                  </span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                    {booking.status === 'Pending' && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="btn btn-ghost btn-xs gap-1">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

BookingsTemplate.displayName = 'BookingsTemplate';
