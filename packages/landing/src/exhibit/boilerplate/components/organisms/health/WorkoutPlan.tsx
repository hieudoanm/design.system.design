import type { FC } from 'react';

interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
}

interface Workout {
  day: string;
  focus: string;
  duration: number;
  exercises: WorkoutExercise[];
}

interface WorkoutPlanProps {
  workouts: Workout[];
  title?: string;
}

export const WorkoutPlan: FC<WorkoutPlanProps> = ({
  workouts,
  title = 'Workout plan',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-4">
      <h3 className="card-title">{title}</h3>
      <ol className="border-base-content/20 relative flex flex-col gap-4 border-l pl-6">
        {workouts.map((workout) => (
          <li key={workout.day} className="relative">
            <span className="bg-primary absolute top-1 -left-[29px] h-3 w-3 rounded-full" />
            <div className="bg-base-100 border-base-content/10 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{workout.day}</h4>
                <span className="badge badge-ghost badge-sm">
                  {workout.focus} · {workout.duration}m
                </span>
              </div>
              <ul className="mt-2 flex flex-col gap-1">
                {workout.exercises.map((exercise) => (
                  <li
                    key={exercise.name}
                    className="text-base-content/60 text-sm">
                    {exercise.name} · {exercise.sets}×{exercise.reps}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
      {workouts.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No workouts scheduled.
        </p>
      )}
    </div>
  </section>
);
