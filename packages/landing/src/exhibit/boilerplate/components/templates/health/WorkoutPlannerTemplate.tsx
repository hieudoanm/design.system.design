'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiAward, FiClock, FiTarget } from 'react-icons/fi';

type Intensity = 'Low' | 'Medium' | 'High';

interface WorkoutPlan {
  id: string;
  name: string;
  duration: number;
  intensity: Intensity;
  calories: number;
}

const FILTERS: ('All' | Intensity)[] = ['All', 'Low', 'Medium', 'High'];

const PLANS: WorkoutPlan[] = [
  {
    id: 'w1',
    name: 'Morning Yoga Flow',
    duration: 25,
    intensity: 'Low',
    calories: 120,
  },
  {
    id: 'w2',
    name: 'Easy Bike Ride',
    duration: 40,
    intensity: 'Low',
    calories: 260,
  },
  {
    id: 'w3',
    name: 'Full Body Strength',
    duration: 50,
    intensity: 'Medium',
    calories: 380,
  },
  {
    id: 'w4',
    name: 'HIIT Cardio Blast',
    duration: 30,
    intensity: 'High',
    calories: 420,
  },
  {
    id: 'w5',
    name: 'Tempo Run',
    duration: 35,
    intensity: 'High',
    calories: 450,
  },
  {
    id: 'w6',
    name: 'Swim Laps',
    duration: 45,
    intensity: 'Medium',
    calories: 400,
  },
];

export const WorkoutPlannerTemplate: FC = () => {
  const [filter, setFilter] = useState<'All' | Intensity>('All');
  const [started, setStarted] = useState<Record<string, boolean>>({});

  const visible = PLANS.filter(
    (plan) => filter === 'All' || plan.intensity === filter
  );

  const startWorkout = (id: string) => {
    setStarted((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Workout Plans</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Your training schedule.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`tab ${filter === tab ? 'tab-active' : ''}`}>
                {tab}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">
            {visible.length} workouts
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((plan) => (
            <div
              key={plan.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-sm font-semibold">{plan.name}</h2>
                  <span className="badge badge-neutral badge-sm">
                    {plan.intensity}
                  </span>
                </div>
                <p className="text-base-content/50 flex flex-wrap items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <FiClock className="h-3.5 w-3.5" />
                    {plan.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <FiTarget className="h-3.5 w-3.5" />
                    {plan.calories} kcal
                  </span>
                </p>
                {started[plan.id] ? (
                  <span className="badge badge-success w-fit gap-1">
                    <FiAward />
                    Workout started
                  </span>
                ) : (
                  <button
                    onClick={() => startWorkout(plan.id)}
                    className="btn btn-primary btn-sm w-fit">
                    Start workout
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

WorkoutPlannerTemplate.displayName = 'WorkoutPlannerTemplate';
