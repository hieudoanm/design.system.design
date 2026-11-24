'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock, FiPlus } from 'react-icons/fi';

interface TimeEntry {
  id: string;
  project: string;
  hours: number;
  day: string;
}

const INITIAL_ENTRIES: TimeEntry[] = [
  { id: 't1', project: 'Website redesign', hours: 3, day: 'Mon' },
  { id: 't2', project: 'Mobile app', hours: 4, day: 'Mon' },
  { id: 't3', project: 'API integration', hours: 2, day: 'Tue' },
  { id: 't4', project: 'Website redesign', hours: 5, day: 'Wed' },
];

const PROJECTS = ['Website redesign', 'Mobile app', 'API integration'];

const getTotal = (entries: TimeEntry[]): number =>
  entries.reduce((sum, entry) => sum + entry.hours, 0);

export const TimesheetsTemplate: FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>(INITIAL_ENTRIES);
  const [formOpen, setFormOpen] = useState(false);
  const [project, setProject] = useState(PROJECTS[0]);
  const [hours, setHours] = useState('');

  const total = getTotal(entries);

  const addEntry = () => {
    const value = Number(hours);
    setEntries((prev) => [
      ...prev,
      {
        id: `t${Date.now()}`,
        project,
        hours: Number.isFinite(value) ? value : 0,
        day: 'Today',
      },
    ]);
    setFormOpen(false);
    setHours('');
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Timesheets</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Log hours across your projects for the week.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-base-content/50 text-sm">Weekly timesheet</p>
          <button
            onClick={() => setFormOpen((open) => !open)}
            className="btn btn-primary btn-sm">
            <FiPlus />
            Log time
          </button>
        </div>

        {formOpen && (
          <div className="card bg-base-200 border-base-content/10 mb-4 border">
            <div className="card-body flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-1">
                <label htmlFor="entry-project" className="text-sm font-medium">
                  Project
                </label>
                <select
                  id="entry-project"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="select select-bordered select-sm">
                  {PROJECTS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="entry-hours" className="text-sm font-medium">
                  Hours
                </label>
                <input
                  id="entry-hours"
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Hours"
                  className="input input-bordered input-sm w-24"
                />
              </div>
              <button onClick={addEntry} className="btn btn-primary btn-sm">
                Add entry
              </button>
            </div>
          </div>
        )}

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Day</th>
                    <th className="px-4 py-3 text-right font-medium">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {entry.project}
                      </td>
                      <td className="px-4 py-3 text-sm">{entry.day}</td>
                      <td className="px-4 py-3 text-right text-sm">
                        {entry.hours}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-base-content/10 flex items-center justify-between border-t px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <FiClock className="text-base-content/50 h-4 w-4" />
                <span className="text-base-content/50">Total</span>
              </div>
              <p className="text-sm font-semibold">Total {total}h</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

TimesheetsTemplate.displayName = 'TimesheetsTemplate';
