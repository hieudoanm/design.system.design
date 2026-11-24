import type { FC } from 'react';

interface DoctorCardProps {
  name: string;
  specialty: string;
  rating: number;
  reviews?: number;
  availability?: string;
  onBook?: () => void;
}

export const DoctorCard: FC<DoctorCardProps> = ({
  name,
  specialty,
  rating,
  reviews,
  availability,
  onBook,
}) => {
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('');
  return (
    <div className="card bg-base-100 w-full shadow" data-testid="doctor-card">
      <div className="card-body items-center gap-3 text-center">
        <div className="avatar">
          <div className="bg-primary text-primary-content flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold">
            {initials}
          </div>
        </div>
        <div>
          <h3 className="card-title text-base">{name}</h3>
          <p className="text-base-content/60 text-sm">{specialty}</p>
        </div>
        <p className="text-sm" data-testid="doctor-rating">
          ⭐ {rating.toFixed(1)}
          {reviews !== undefined && (
            <span className="text-base-content/50"> · {reviews} reviews</span>
          )}
        </p>
        {availability && <p className="text-success text-xs">{availability}</p>}
        {onBook && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onBook}>
            Book appointment
          </button>
        )}
      </div>
    </div>
  );
};
