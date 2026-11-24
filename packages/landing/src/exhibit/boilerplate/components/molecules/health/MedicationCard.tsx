'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface MedicationCardProps {
  name: string;
  dose: string;
  time: string;
  frequency?: string;
  taken?: boolean;
  onToggle?: (taken: boolean) => void;
}

export const MedicationCard: FC<MedicationCardProps> = ({
  name,
  dose,
  time,
  frequency,
  taken = false,
  onToggle,
}) => {
  const [isTaken, setIsTaken] = useState(taken);

  const handleToggle = () => {
    const next = !isTaken;
    setIsTaken(next);
    onToggle?.(next);
  };

  return (
    <div
      className="card bg-base-100 w-full shadow"
      data-testid="medication-card">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">{name}</h3>
          <span
            className={`badge ${isTaken ? 'badge-success' : 'badge-warning'}`}>
            {isTaken ? 'Taken' : 'Pending'}
          </span>
        </div>
        <p className="text-base-content/60 text-sm">
          {dose} · {time}
          {frequency && ` · ${frequency}`}
        </p>
        <button
          type="button"
          className={`btn btn-sm ${isTaken ? 'btn-ghost' : 'btn-primary'}`}
          onClick={handleToggle}>
          {isTaken ? 'Mark as not taken' : 'Mark as taken'}
        </button>
      </div>
    </div>
  );
};
