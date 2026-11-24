'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiFilm, FiHome, FiMoon, FiSun, FiUnlock } from 'react-icons/fi';

interface Scene {
  id: string;
  name: string;
  description: string;
  icon: typeof FiHome;
  devices: number;
}

const SCENES: Scene[] = [
  {
    id: 'movie',
    name: 'Movie Night',
    description: 'Dimmer lights, surround sound',
    icon: FiFilm,
    devices: 5,
  },
  {
    id: 'morning',
    name: 'Morning',
    description: 'Open blinds, warm lighting',
    icon: FiSun,
    devices: 4,
  },
  {
    id: 'away',
    name: 'Away',
    description: 'Lock doors, disarm interior sensors',
    icon: FiUnlock,
    devices: 6,
  },
  {
    id: 'goodnight',
    name: 'Goodnight',
    description: 'Lights off, lock all doors',
    icon: FiMoon,
    devices: 3,
  },
];

export const ScenesTemplate: FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const toggleScene = (id: string) => {
    setActiveId((current) => (current === id ? null : id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Scenes</h1>
          <span className="badge badge-ghost badge-sm">4 scenes</span>
        </div>
        <p className="text-base-content/50 mt-1 text-sm">
          One tap to set the whole home mood.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SCENES.map((scene) => {
            const Icon = scene.icon;
            const isActive = activeId === scene.id;
            return (
              <div
                key={scene.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-5">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary rounded-lg p-3">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold">{scene.name}</p>
                      <p className="text-base-content/50 text-xs">
                        {scene.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={
                        isActive
                          ? 'badge badge-success badge-sm'
                          : 'badge badge-ghost badge-sm'
                      }>
                      {isActive ? 'Scene active' : 'Not active'}
                    </span>
                    <span className="text-base-content/50 text-sm">
                      {scene.devices} devices
                    </span>
                  </div>
                  <button
                    onClick={() => toggleScene(scene.id)}
                    className="btn btn-primary btn-sm mt-3">
                    {isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

ScenesTemplate.displayName = 'ScenesTemplate';
