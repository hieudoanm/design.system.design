'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiThermometer } from 'react-icons/fi';

type Mode = 'Heat' | 'Cool' | 'Auto';

const MODES: Mode[] = ['Heat', 'Cool', 'Auto'];

const nextMode = (mode: Mode): Mode => {
  const index = MODES.indexOf(mode);
  return MODES[(index + 1) % MODES.length];
};

export const DeviceDetailTemplate: FC = () => {
  const [mode, setMode] = useState<Mode>('Heat');

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Device Detail</h1>
          <span className="badge badge-ghost badge-sm">1 device</span>
        </div>
        <p className="text-base-content/50 mt-1 text-sm">
          Configure and monitor a single smart device.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary rounded-lg p-3">
                <FiThermometer className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold">Living Room Thermostat</p>
                <p className="text-base-content/50 text-xs">
                  Device ID: TH-204
                </p>
              </div>
              <span className="badge badge-success badge-sm ml-auto">
                Online
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="stat bg-base-300/40 rounded-xl p-4">
                <p className="stat-title">Current temperature</p>
                <p className="stat-value text-3xl">72°F</p>
              </div>
              <div className="stat bg-base-300/40 rounded-xl p-4">
                <p className="stat-title">Target temperature</p>
                <p className="stat-value text-3xl">Target 70°F</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-base-content/50 text-xs">Mode</p>
              <div className="tabs tabs-boxed tabs-sm mt-2 w-fit">
                {MODES.map((item) => (
                  <button
                    key={item}
                    onClick={() => setMode(item)}
                    className={`tab ${mode === item ? 'tab-active' : ''}`}>
                    {item}
                  </button>
                ))}
              </div>
              <p className="text-base-content/50 mt-3 text-sm">
                Current mode: {mode}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setMode((current) => nextMode(current))}
                className="btn btn-primary btn-sm">
                Change mode
              </button>
              <span className="badge badge-ghost badge-sm">Battery 98%</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

DeviceDetailTemplate.displayName = 'DeviceDetailTemplate';
