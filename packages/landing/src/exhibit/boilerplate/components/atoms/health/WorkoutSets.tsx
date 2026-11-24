import type { FC } from 'react';

interface WorkoutSetsProps {
  sets: number;
  reps: number;
  className?: string;
}

export const WorkoutSets: FC<WorkoutSetsProps> = ({
  sets,
  reps,
  className = '',
}) => (
  <div data-testid="workout-sets" className={className}>
    <p className="text-2xl font-semibold">
      {sets} × {reps}
    </p>
    <p className="text-base-content/60 text-sm">sets × reps</p>
  </div>
);
