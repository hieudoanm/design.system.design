'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCalendar, FiClock, FiTrash2, FiUsers } from 'react-icons/fi';

type ReservationStatus = 'Confirmed' | 'Pending' | 'Cancelled';

interface Reservation {
  id: string;
  restaurant: string;
  date: string;
  time: string;
  guests: number;
  status: ReservationStatus;
}

const RESERVATIONS: Reservation[] = [
  {
    id: 'b1',
    restaurant: 'Trattoria Fiore',
    date: 'Aug 15, 2026',
    time: '19:30',
    guests: 4,
    status: 'Confirmed',
  },
  {
    id: 'b2',
    restaurant: 'Sakura House',
    date: 'Aug 18, 2026',
    time: '20:00',
    guests: 2,
    status: 'Pending',
  },
  {
    id: 'b3',
    restaurant: 'Green Garden',
    date: 'Aug 21, 2026',
    time: '12:30',
    guests: 6,
    status: 'Confirmed',
  },
  {
    id: 'b4',
    restaurant: 'Ramen Kaze',
    date: 'Aug 24, 2026',
    time: '19:45',
    guests: 3,
    status: 'Pending',
  },
];

const getStatusBadge = (status: ReservationStatus) => {
  if (status === 'Confirmed') {
    return <span className="badge badge-success badge-sm">Confirmed</span>;
  }
  if (status === 'Pending') {
    return <span className="badge badge-warning badge-sm">Pending</span>;
  }
  return <span className="badge badge-error badge-sm">Cancelled</span>;
};

export const ReservationsTemplate: FC = () => {
  const [reservations, setReservations] = useState(RESERVATIONS);

  const cancel = (id: string) => {
    setReservations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: 'Cancelled' } : item
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Reservations</h1>
        <p className="text-base-content/50 mt-1 text-sm">Upcoming bookings.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-base-content/50 text-sm">
            {reservations.length} reservations
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {reservations.map((reservation) => (
            <article
              key={reservation.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body flex-row items-center justify-between gap-3 p-5">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold">
                    {reservation.restaurant}
                  </p>
                  <p className="text-base-content/50 flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="h-3.5 w-3.5" />
                      {reservation.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="h-3.5 w-3.5" />
                      {reservation.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiUsers className="h-3.5 w-3.5" />
                      {reservation.guests} guests
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(reservation.status)}
                  {reservation.status === 'Pending' && (
                    <button
                      onClick={() => cancel(reservation.id)}
                      className="btn btn-outline btn-sm gap-1">
                      <FiTrash2 className="h-4 w-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

ReservationsTemplate.displayName = 'ReservationsTemplate';
