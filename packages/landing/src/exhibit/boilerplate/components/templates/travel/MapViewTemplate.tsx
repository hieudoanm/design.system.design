'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiLayers, FiMap, FiMapPin, FiNavigation } from 'react-icons/fi';

type MapLayer = 'Standard' | 'Satellite';

interface Neighborhood {
  name: string;
  range: string;
}

const NEIGHBORHOODS: Neighborhood[] = [
  { name: 'Maple Grove', range: '$650K - $900K' },
  { name: 'Riverside', range: '$450K - $600K' },
  { name: 'Downtown', range: '$700K - $1.3M' },
  { name: 'Birchwood Hills', range: '$1.2M - $2.4M' },
];

const LAYERS: MapLayer[] = ['Standard', 'Satellite'];

export const MapViewTemplate: FC = () => {
  const [mapOpen, setMapOpen] = useState(false);
  const [layer, setLayer] = useState<MapLayer>('Standard');

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Map View</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Explore neighborhoods by price.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base-content/50 text-sm">4 neighborhoods</p>
          <div className="flex items-center gap-2">
            <p className="text-base-content/50 text-sm">
              {mapOpen ? 'Map is open' : 'Map is closed'}
            </p>
            <button
              type="button"
              onClick={() => setMapOpen((prev) => !prev)}
              className="btn btn-primary btn-sm gap-1">
              <FiMap />
              Open map
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div
            className={`border-base-content/10 relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border ${
              mapOpen ? 'bg-base-200' : 'bg-base-300/50'
            }`}>
            <div className="bg-base-content/10 absolute inset-0 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:40px_40px] opacity-40" />
            <div className="relative flex flex-col items-center gap-2">
              <FiNavigation className="text-base-content/40 h-8 w-8" />
              <p className="text-base-content/50 text-sm">
                {layer} view map area
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="badge badge-success badge-xs" />
                Under $500K
              </span>
              <span className="flex items-center gap-1">
                <span className="badge badge-warning badge-xs" />
                $500K - $1M
              </span>
              <span className="flex items-center gap-1">
                <span className="badge badge-error badge-xs" />
                Over $1M
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FiLayers className="text-base-content/50 h-4 w-4" />
              <div className="tabs tabs-boxed tabs-sm w-fit">
                {LAYERS.map((item) => (
                  <button
                    key={item}
                    onClick={() => setLayer(item)}
                    className={`tab ${layer === item ? 'tab-active' : ''}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {NEIGHBORHOODS.map((neighborhood) => (
            <div
              key={neighborhood.name}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-2 p-5">
                <div className="flex items-center gap-2">
                  <FiMapPin className="text-primary h-4 w-4 shrink-0" />
                  <p className="text-sm font-medium">{neighborhood.name}</p>
                </div>
                <p className="text-base-content/50 text-xs">
                  Avg. price {neighborhood.range}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

MapViewTemplate.displayName = 'MapViewTemplate';
