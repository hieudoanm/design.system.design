'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface HydrationTrackerProps {
  goal?: number;
  glassSize?: number;
  initialGlasses?: number;
  title?: string;
}

export const HydrationTracker: FC<HydrationTrackerProps> = ({
  goal = 8,
  glassSize = 250,
  initialGlasses = 0,
  title = 'Hydration tracker',
}) => {
  const [glasses, setGlasses] = useState(initialGlasses);

  const add = (): void => setGlasses((current) => Math.min(current + 1, goal));
  const remove = (): void => setGlasses((current) => Math.max(current - 1, 0));

  return (
    <section className="card bg-base-200 w-full">
      <div className="card-body flex flex-col gap-4">
        <h3 className="card-title">{title}</h3>
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: goal }, (_, index) => (
            <span
              key={index}
              data-testid={index < glasses ? 'glass-filled' : 'glass-empty'}
              className={`h-8 w-5 rounded-b ${
                index < glasses ? 'bg-primary' : 'bg-base-300'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm" data-testid="volume">
          {glasses * glassSize} ml of {goal * glassSize} ml
        </p>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={remove}
            disabled={glasses === 0}
            data-testid="remove-glass">
            − Remove
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={add}
            disabled={glasses === goal}
            data-testid="add-glass">
            + Add glass
          </button>
        </div>
      </div>
    </section>
  );
};
