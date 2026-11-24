'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiBell, FiMapPin, FiSettings } from 'react-icons/fi';

type Unit = 'C' | 'F';

const TIMEZONES = [
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo',
];

export const SmartHomeSettingsTemplate: FC = () => {
  const [homeName, setHomeName] = useState('My Home');
  const [location, setLocation] = useState('San Francisco');
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [unit, setUnit] = useState<Unit>('F');
  const [notifications, setNotifications] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Smart Home Settings
          </h1>
          <span className="badge badge-ghost badge-sm">5 settings</span>
        </div>
        <p className="text-base-content/50 mt-1 text-sm">
          Configure your home profile and preferences.
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body space-y-5 p-5">
            <div>
              <label className="label" htmlFor="home-name">
                <span className="label-text">Home name</span>
              </label>
              <input
                id="home-name"
                type="text"
                className="input input-bordered w-full"
                value={homeName}
                onChange={(event) => setHomeName(event.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="location">
                <span className="label-text">Location</span>
              </label>
              <input
                id="location"
                type="text"
                className="input input-bordered w-full"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="timezone">
                <span className="label-text">Timezone</span>
              </label>
              <select
                id="timezone"
                className="select select-bordered w-full"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}>
                {TIMEZONES.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Units</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUnit('C')}
                  className={`btn btn-sm ${unit === 'C' ? 'btn-primary' : 'btn-ghost'}`}>
                  °C
                </button>
                <button
                  onClick={() => setUnit('F')}
                  className={`btn btn-sm ${unit === 'F' ? 'btn-primary' : 'btn-ghost'}`}>
                  °F
                </button>
                <span className="text-base-content/50 text-sm">
                  Units: {unit === 'C' ? '°C' : '°F'}
                </span>
              </div>
            </div>

            <div className="border-base-content/10 flex items-center justify-between rounded-xl border p-3">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary rounded-lg p-2">
                  <FiBell />
                </span>
                <div>
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-base-content/50 text-xs">
                    Push alerts for security events
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNotifications((current) => !current)}
                className="btn btn-sm">
                {notifications
                  ? 'Disable notifications'
                  : 'Enable notifications'}
              </button>
            </div>

            <div className="border-base-content/10 flex items-center gap-3 border-t pt-4">
              <button
                onClick={() => setSaved((current) => !current)}
                className="btn btn-primary">
                {saved ? 'Saved' : 'Save settings'}
              </button>
              {saved && (
                <span className="text-success text-sm font-medium">
                  Settings saved
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="text-base-content/50 mt-4 flex items-center gap-2 text-xs">
          <FiMapPin className="text-base-content/30" />
          {homeName} • {location} • {timezone}
          <FiSettings className="text-base-content/30 ml-1" />
        </p>
      </main>
    </div>
  );
};

SmartHomeSettingsTemplate.displayName = 'SmartHomeSettingsTemplate';
