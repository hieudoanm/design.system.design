'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiAlertCircle,
  FiCamera,
  FiCheckCircle,
  FiShield,
} from 'react-icons/fi';

const CAMERAS = [
  { id: 'front', name: 'Front Door Cam' },
  { id: 'back', name: 'Backyard Cam' },
  { id: 'garage', name: 'Garage Cam' },
];

const SENSORS = [
  { id: 'front', name: 'Front Door Sensor', open: false },
  { id: 'garage', name: 'Garage Door Sensor', open: false },
  { id: 'motion', name: 'Motion Detector', open: true },
];

const ACTIVITY = [
  'Front door opened at 8:42 PM',
  'Motion detected in hallway at 8:15 PM',
  'Backyard camera detected movement at 7:58 PM',
  'System disarmed at 7:00 PM',
  'Front door closed at 6:47 PM',
  'Garage door opened at 6:30 PM',
];

export const SecurityTemplate: FC = () => {
  const [armed, setArmed] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Security</h1>
          <span className="badge badge-ghost badge-sm">3 cameras</span>
          <span className="badge badge-ghost badge-sm">3 sensors</span>
        </div>
        <p className="text-base-content/50 mt-1 text-sm">
          Keep your home protected around the clock.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary rounded-lg p-3">
                  <FiShield className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">Home Security</p>
                  <p className="text-base-content/50 text-xs">
                    All systems {armed ? 'armed' : 'disarmed'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={
                    armed
                      ? 'badge badge-success badge-sm'
                      : 'badge badge-warning badge-sm'
                  }>
                  {armed ? 'Armed' : 'Disarmed'}
                </span>
                <button
                  onClick={() => setArmed((current) => !current)}
                  className="btn btn-sm">
                  {armed ? 'Disarm system' : 'Arm system'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold">Camera feeds</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CAMERAS.map((camera) => (
              <div
                key={camera.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-4">
                  <div className="bg-base-300 text-base-content/50 flex aspect-video items-center justify-center rounded-lg">
                    <FiCamera className="h-6 w-6" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm font-medium">{camera.name}</p>
                    <span className="badge badge-success badge-xs">Live</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Sensors</h2>
            <div className="card bg-base-200 border-base-content/10 mt-3 border">
              <div className="card-body p-0">
                <ul className="divide-base-content/10 divide-y">
                  {SENSORS.map((sensor) => (
                    <li
                      key={sensor.id}
                      className="flex items-center justify-between px-5 py-4">
                      <span className="text-sm font-medium">{sensor.name}</span>
                      <span
                        className={
                          sensor.open
                            ? 'badge badge-warning badge-sm'
                            : 'badge badge-success badge-sm'
                        }>
                        {sensor.open ? 'Open' : 'Closed'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Recent activity</h2>
              <span className="badge badge-ghost badge-sm">
                {ACTIVITY.length} events
              </span>
            </div>
            <div className="card bg-base-200 border-base-content/10 mt-3 border">
              <div className="card-body p-0">
                <ul className="divide-base-content/10 divide-y">
                  {ACTIVITY.map((event) => (
                    <li
                      key={event}
                      className="flex items-start gap-3 px-5 py-3">
                      {event.startsWith('Motion') ||
                      event.includes('movement') ? (
                        <FiAlertCircle className="text-warning mt-1 shrink-0" />
                      ) : (
                        <FiCheckCircle className="text-success mt-1 shrink-0" />
                      )}
                      <span className="text-sm">{event}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

SecurityTemplate.displayName = 'SecurityTemplate';
