'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiActivity,
  FiCamera,
  FiLock,
  FiPower,
  FiSpeaker,
  FiSun,
  FiThermometer,
} from 'react-icons/fi';

interface Device {
  id: string;
  name: string;
  location: string;
  icon: typeof FiActivity;
  online: boolean;
}

const DEVICES: Device[] = [
  {
    id: 'thermostat',
    name: 'Thermostat',
    location: 'Living Room',
    icon: FiThermometer,
    online: true,
  },
  {
    id: 'lights',
    name: 'Lights',
    location: 'Kitchen',
    icon: FiSun,
    online: true,
  },
  {
    id: 'cameras',
    name: 'Cameras',
    location: 'Front Door',
    icon: FiCamera,
    online: true,
  },
  {
    id: 'locks',
    name: 'Locks',
    location: 'Front Door',
    icon: FiLock,
    online: true,
  },
  {
    id: 'speakers',
    name: 'Speakers',
    location: 'Office',
    icon: FiSpeaker,
    online: false,
  },
  {
    id: 'sensors',
    name: 'Sensors',
    location: 'Hallway',
    icon: FiActivity,
    online: true,
  },
];

export const DeviceDashboardTemplate: FC = () => {
  const [powered, setPowered] = useState<Record<string, boolean>>({
    thermostat: true,
    lights: true,
    cameras: false,
    locks: true,
    speakers: false,
    sensors: false,
  });

  const togglePower = (id: string) => {
    setPowered((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const onlineCount = DEVICES.filter((device) => device.online).length;

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Device Dashboard</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Control every smart device from one place.
        </p>
      </header>

      <main className="mx-auto w-full max-w-6xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <p className="text-base-content/50 text-sm">
            {DEVICES.length} devices
          </p>
          <span className="badge badge-success badge-sm">
            {onlineCount} online
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEVICES.map((device) => {
            const Icon = device.icon;
            const isOn = powered[device.id];
            return (
              <div
                key={device.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary rounded-lg p-3">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold">{device.name}</p>
                        <p className="text-base-content/50 text-xs">
                          {device.location}
                        </p>
                      </div>
                    </div>
                    <span
                      className={
                        device.online
                          ? 'badge badge-success badge-sm'
                          : 'badge badge-error badge-sm'
                      }>
                      {device.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-base-content/50 text-sm">
                      {isOn ? 'On' : 'Off'}
                    </span>
                    <button
                      onClick={() => togglePower(device.id)}
                      className="btn btn-sm gap-1">
                      <FiPower />
                      {isOn ? 'Turn off' : 'Turn on'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

DeviceDashboardTemplate.displayName = 'DeviceDashboardTemplate';
