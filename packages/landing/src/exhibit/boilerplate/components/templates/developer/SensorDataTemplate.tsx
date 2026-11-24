'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiActivity,
  FiCpu,
  FiDroplet,
  FiThermometer,
  FiWind,
} from 'react-icons/fi';

type Unit = 'F' | 'C';

const READINGS = [
  {
    id: 'living-temp',
    sensor: 'Living Room Temp',
    reading: '71.2°F',
    time: '8:41 AM',
  },
  {
    id: 'kitchen-temp',
    sensor: 'Kitchen Temp',
    reading: '73.8°F',
    time: '8:40 AM',
  },
  {
    id: 'bedroom-hum',
    sensor: 'Bedroom Humidity',
    reading: '48%',
    time: '8:39 AM',
  },
  {
    id: 'living-hum',
    sensor: 'Living Room Humidity',
    reading: '46%',
    time: '8:38 AM',
  },
  {
    id: 'office-air',
    sensor: 'Office Air Quality',
    reading: '55 AQI',
    time: '8:37 AM',
  },
  {
    id: 'hallway',
    sensor: 'Hallway Motion',
    reading: 'Clear',
    time: '8:36 AM',
  },
];

export const SensorDataTemplate: FC = () => {
  const [unit, setUnit] = useState<Unit>('F');

  const temperature = unit === 'F' ? '72.4°F' : '22.4°C';

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Sensor Data</h1>
          <span className="badge badge-success badge-sm">
            12 sensors online
          </span>
        </div>
        <p className="text-base-content/50 mt-1 text-sm">
          Live readings from sensors across your home.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="text-base-content/50 flex items-center gap-2">
                <FiThermometer />
                <p className="stat-title">Temperature</p>
              </div>
              <p className="stat-value text-2xl">{temperature}</p>
              <button
                onClick={() => setUnit(unit === 'F' ? 'C' : 'F')}
                className="btn btn-ghost btn-xs mt-2 w-fit">
                {unit === 'F' ? 'Switch to °C' : 'Switch to °F'}
              </button>
            </div>
          </div>

          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="text-base-content/50 flex items-center gap-2">
                <FiDroplet />
                <p className="stat-title">Humidity</p>
              </div>
              <p className="stat-value text-2xl">50%</p>
            </div>
          </div>

          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="text-base-content/50 flex items-center gap-2">
                <FiWind />
                <p className="stat-title">Air Quality</p>
              </div>
              <p className="stat-value text-2xl">52 AQI</p>
            </div>
          </div>

          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="text-base-content/50 flex items-center gap-2">
                <FiActivity />
                <p className="stat-title">Motion</p>
              </div>
              <p className="stat-value text-2xl">No motion</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <h2 className="text-xl font-semibold">Recent readings</h2>
          <span className="badge badge-ghost badge-sm">
            {READINGS.length} readings
          </span>
        </div>
        <div className="card bg-base-200 border-base-content/10 mt-3 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr className="text-base-content/40 text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Sensor</th>
                    <th className="px-4 py-3 font-medium">Reading</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {READINGS.map((item) => (
                    <tr
                      key={item.id}
                      className="border-base-content/10 border-b">
                      <td className="flex items-center gap-2 px-4 py-3 text-sm">
                        <FiCpu className="text-base-content/50" />
                        {item.sensor}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.reading}</td>
                      <td className="px-4 py-3 text-sm">{item.time}</td>
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

SensorDataTemplate.displayName = 'SensorDataTemplate';
