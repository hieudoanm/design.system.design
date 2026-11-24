import type { FC } from 'react';

type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

interface AppointmentCardProps {
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location?: string;
  status?: AppointmentStatus;
  onCancel?: () => void;
}

const statusBadges: Record<AppointmentStatus, string> = {
  upcoming: 'badge-primary',
  completed: 'badge-success',
  cancelled: 'badge-error',
};

export const AppointmentCard: FC<AppointmentCardProps> = ({
  doctor,
  specialty,
  date,
  time,
  location,
  status = 'upcoming',
  onCancel,
}) => (
  <div
    className="card bg-base-100 w-full shadow"
    data-testid="appointment-card">
    <div className="card-body gap-3">
      <div className="flex items-center justify-between">
        <h3 className="card-title text-base">{doctor}</h3>
        <span className={`badge ${statusBadges[status]}`}>{status}</span>
      </div>
      <p className="text-base-content/60 text-sm">{specialty}</p>
      <div className="flex items-center gap-3 text-sm">
        <span className="font-medium">📅 {date}</span>
        <span className="text-base-content/50">🕒 {time}</span>
      </div>
      {location && (
        <p className="text-base-content/60 text-xs">📍 {location}</p>
      )}
      {status === 'upcoming' && onCancel && (
        <button
          type="button"
          className="btn btn-outline btn-error btn-xs"
          onClick={onCancel}>
          Cancel appointment
        </button>
      )}
    </div>
  </div>
);
