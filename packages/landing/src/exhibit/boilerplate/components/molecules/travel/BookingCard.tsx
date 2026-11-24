import type { FC } from 'react';

interface BookingCardProps {
  reference: string;
  title: string;
  date: string;
  status: string;
  price?: number;
  guests?: number;
  currency?: string;
}

const statusClass: Record<string, string> = {
  confirmed: 'badge-success',
  pending: 'badge-warning',
  cancelled: 'badge-error',
  completed: 'badge-neutral',
};

export const BookingCard: FC<BookingCardProps> = ({
  reference,
  title,
  date,
  status,
  price,
  guests,
  currency = '$',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="booking-card">
    <div className="card-body gap-2">
      <div className="flex items-center justify-between">
        <span className="text-base-content/60 font-mono text-xs">
          {reference}
        </span>
        <span
          className={`badge ${statusClass[status] ?? 'badge-neutral'}`}
          data-testid="booking-status">
          {status}
        </span>
      </div>
      <h3 className="card-title text-base">{title}</h3>
      <p className="text-base-content/70 text-sm">📅 {date}</p>
      {guests !== undefined && (
        <p className="text-base-content/70 text-sm">👥 {guests} guests</p>
      )}
      {price !== undefined && (
        <p className="font-semibold" data-testid="booking-price">
          {currency}
          {price.toFixed(2)}
        </p>
      )}
    </div>
  </div>
);
