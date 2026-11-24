'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface WaterTrackerProps {
  glasses: number;
  target: number;
  onAdd?: (glasses: number) => void;
  onRemove?: (glasses: number) => void;
}

export const WaterTracker: FC<WaterTrackerProps> = ({
  glasses: initialGlasses,
  target,
  onAdd,
  onRemove,
}) => {
  const [glasses, setGlasses] = useState(initialGlasses);

  const addGlass = () => {
    const next = glasses + 1;
    setGlasses(next);
    onAdd?.(next);
  };

  const removeGlass = () => {
    const next = Math.max(0, glasses - 1);
    setGlasses(next);
    onRemove?.(next);
  };

  const pct =
    target > 0 ? Math.min(100, Math.round((glasses / target) * 100)) : 0;

  return (
    <div className="card bg-base-100 w-full shadow" data-testid="water-tracker">
      <div className="card-body gap-3">
        <h3 className="card-title text-base">Water</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Remove glass"
            className="btn btn-outline btn-circle btn-sm"
            onClick={removeGlass}>
            −
          </button>
          <div className="flex-1 text-center">
            <p className="text-3xl font-bold" data-testid="water-count">
              {glasses}
              <span className="text-base-content/50 text-base">
                {' '}
                / {target} glasses
              </span>
            </p>
            <progress
              className="progress progress-info h-2 w-full"
              value={pct}
              max={100}
            />
          </div>
          <button
            type="button"
            aria-label="Add glass"
            className="btn btn-primary btn-circle btn-sm"
            onClick={addGlass}>
            +
          </button>
        </div>
      </div>
    </div>
  );
};
