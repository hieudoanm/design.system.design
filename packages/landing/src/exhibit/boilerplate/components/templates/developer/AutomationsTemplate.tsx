'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock, FiZap } from 'react-icons/fi';

interface Automation {
  id: string;
  name: string;
  schedule: string;
  on: boolean;
}

const AUTOMATIONS: Automation[] = [
  {
    id: 'lights',
    name: 'Turn off lights at 11pm',
    schedule: 'Every day at 11:00 PM',
    on: true,
  },
  {
    id: 'vacuum',
    name: 'Start robot vacuum at 9am',
    schedule: 'Every day at 9:00 AM',
    on: true,
  },
  {
    id: 'thermostat',
    name: 'Adjust thermostat at 6pm',
    schedule: 'Every day at 6:00 PM',
    on: false,
  },
  {
    id: 'locks',
    name: 'Lock doors at 10pm',
    schedule: 'Every day at 10:00 PM',
    on: false,
  },
];

export const AutomationsTemplate: FC = () => {
  const [automations, setAutomations] = useState<Automation[]>(AUTOMATIONS);

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, on: !item.on } : item))
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
          <span className="badge badge-ghost badge-sm">
            {automations.length} automations
          </span>
        </div>
        <p className="text-base-content/50 mt-1 text-sm">
          Set it and forget it — routines run on schedule.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <ul className="divide-base-content/10 divide-y">
              {automations.map((automation) => (
                <li
                  key={automation.id}
                  className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary rounded-lg p-2">
                      {automation.name.startsWith('Turn off') ? (
                        <FiClock />
                      ) : (
                        <FiZap />
                      )}
                    </span>
                    <div>
                      <p className="font-medium">{automation.name}</p>
                      <p className="text-base-content/50 text-xs">
                        {automation.schedule}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        automation.on
                          ? 'badge badge-success badge-sm'
                          : 'badge badge-ghost badge-sm'
                      }>
                      {automation.on ? 'Active' : 'Paused'}
                    </span>
                    <button
                      onClick={() => toggleAutomation(automation.id)}
                      className="btn btn-sm">
                      {automation.on ? 'Turn off' : 'Turn on'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

AutomationsTemplate.displayName = 'AutomationsTemplate';
