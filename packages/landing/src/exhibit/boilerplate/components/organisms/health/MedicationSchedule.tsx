'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken?: boolean;
}

interface MedicationScheduleProps {
  medications: Medication[];
  title?: string;
}

export const MedicationSchedule: FC<MedicationScheduleProps> = ({
  medications,
  title = 'Medication schedule',
}) => {
  const [takenIds, setTakenIds] = useState<Set<string>>(
    () =>
      new Set(
        medications.filter((medication) => medication.taken).map((m) => m.id)
      )
  );

  const toggle = (id: string): void => {
    setTakenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section className="card bg-base-200 w-full">
      <div className="card-body flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title">{title}</h3>
          <span
            className="badge badge-primary badge-sm"
            data-testid="taken-count">
            {takenIds.size} of {medications.length} taken
          </span>
        </div>
        {medications.map((medication) => (
          <label
            key={medication.id}
            className="bg-base-100 border-base-content/10 flex items-center gap-3 rounded-xl border p-4">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={takenIds.has(medication.id)}
              onChange={() => toggle(medication.id)}
              aria-label={`Mark ${medication.name} as taken`}
              data-testid={`toggle-${medication.id}`}
            />
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium">{medication.name}</span>
              <span className="text-base-content/50 text-xs">
                {medication.dosage} · {medication.time}
              </span>
            </div>
            {takenIds.has(medication.id) && (
              <span className="badge badge-success badge-sm">Taken</span>
            )}
          </label>
        ))}
        {medications.length === 0 && (
          <p className="text-base-content/40 text-sm" data-testid="empty">
            No medications scheduled.
          </p>
        )}
      </div>
    </section>
  );
};
