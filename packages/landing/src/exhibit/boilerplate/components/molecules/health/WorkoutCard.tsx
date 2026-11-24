import type { FC } from 'react';

type Intensity = 'low' | 'moderate' | 'high';

interface WorkoutCardProps {
  name: string;
  duration: number;
  calories: number;
  type?: string;
  intensity?: Intensity;
  date?: string;
  completed?: boolean;
}

const intensityBadges: Record<Intensity, string> = {
  low: 'badge-info',
  moderate: 'badge-warning',
  high: 'badge-error',
};

export const WorkoutCard: FC<WorkoutCardProps> = ({
  name,
  duration,
  calories,
  type,
  intensity,
  date,
  completed = false,
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="workout-card">
    <div className="card-body gap-3">
      <div className="flex items-center justify-between">
        <h3 className="card-title text-base">{name}</h3>
        {intensity && (
          <span className={`badge ${intensityBadges[intensity]}`}>
            {intensity}
          </span>
        )}
      </div>
      {type && <p className="text-base-content/60 text-sm">{type}</p>}
      <div className="flex items-center gap-4">
        <span className="text-xl font-bold" data-testid="workout-duration">
          {duration} min
        </span>
        <span className="text-base-content/60 text-sm">{calories} kcal</span>
      </div>
      <div className="flex items-center justify-between">
        {date && <span className="text-base-content/50 text-xs">{date}</span>}
        <span
          className={`badge ${completed ? 'badge-success' : 'badge-ghost'}`}>
          {completed ? 'Done' : 'Scheduled'}
        </span>
      </div>
    </div>
  </div>
);
