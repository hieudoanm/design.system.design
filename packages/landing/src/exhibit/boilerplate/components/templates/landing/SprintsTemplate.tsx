'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPlay } from 'react-icons/fi';

type SprintStatus = 'Active' | 'Planned' | 'Complete';

interface Sprint {
  id: string;
  name: string;
  status: SprintStatus;
  points: number;
}

const INITIAL_SPRINTS: Sprint[] = [
  { id: 's1', name: 'Sprint 12', status: 'Active', points: 34 },
  { id: 's2', name: 'Sprint 13', status: 'Planned', points: 26 },
  { id: 's3', name: 'Sprint 11', status: 'Complete', points: 40 },
  { id: 's4', name: 'Sprint 14', status: 'Planned', points: 18 },
];

const getStatusBadge = (status: SprintStatus) => {
  switch (status) {
    case 'Active':
      return <span className="badge badge-success badge-sm">Active</span>;
    case 'Complete':
      return <span className="badge badge-neutral badge-sm">Complete</span>;
    default:
      return <span className="badge badge-warning badge-sm">Planned</span>;
  }
};

export const SprintsTemplate: FC = () => {
  const [sprints, setSprints] = useState<Sprint[]>(INITIAL_SPRINTS);

  const startSprint = (id: string) => {
    setSprints((prev) =>
      prev.map((sprint) =>
        sprint.id === id ? { ...sprint, status: 'Active' } : sprint
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Sprints</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Plan and run scrum sprints with story points.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Sprint</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Story points</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sprints.map((sprint) => (
                    <tr
                      key={sprint.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {sprint.name}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(sprint.status)}
                      </td>
                      <td className="px-4 py-3 text-sm">{sprint.points}</td>
                      <td className="px-4 py-3 text-right">
                        {sprint.status === 'Planned' ? (
                          <button
                            onClick={() => startSprint(sprint.id)}
                            className="btn btn-primary btn-sm">
                            <FiPlay />
                            Start sprint
                          </button>
                        ) : (
                          <span className="text-base-content/40 text-xs">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

SprintsTemplate.displayName = 'SprintsTemplate';
