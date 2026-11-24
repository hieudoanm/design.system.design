'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiAward } from 'react-icons/fi';

type WineType = 'Red' | 'White' | 'Sparkling';

interface Wine {
  id: string;
  name: string;
  region: string;
  vintage: number;
  price: number;
  type: WineType;
  pick: boolean;
}

const WINES: Wine[] = [
  {
    id: 'w1',
    name: 'Barolo Riserva',
    region: 'Piedmont, Italy',
    vintage: 2021,
    price: 42,
    type: 'Red',
    pick: true,
  },
  {
    id: 'w2',
    name: 'Pinot Noir Reserve',
    region: 'Willamette Valley, USA',
    vintage: 2022,
    price: 38,
    type: 'Red',
    pick: false,
  },
  {
    id: 'w3',
    name: 'Malbec Gran Reserva',
    region: 'Mendoza, Argentina',
    vintage: 2020,
    price: 35,
    type: 'Red',
    pick: false,
  },
  {
    id: 'w4',
    name: 'Chablis Premier Cru',
    region: 'Burgundy, France',
    vintage: 2022,
    price: 45,
    type: 'White',
    pick: true,
  },
  {
    id: 'w5',
    name: 'Sauvignon Blanc',
    region: 'Marlborough, New Zealand',
    vintage: 2023,
    price: 28,
    type: 'White',
    pick: false,
  },
  {
    id: 'w6',
    name: 'Prosecco Superiore',
    region: 'Veneto, Italy',
    vintage: 2023,
    price: 24,
    type: 'Sparkling',
    pick: false,
  },
  {
    id: 'w7',
    name: 'Champagne Brut',
    region: 'Champagne, France',
    vintage: 2021,
    price: 55,
    type: 'Sparkling',
    pick: true,
  },
];

const TYPES: Array<'All' | WineType> = ['All', 'Red', 'White', 'Sparkling'];

export const WineListTemplate: FC = () => {
  const [type, setType] = useState<'All' | WineType>('All');

  const visible = WINES.filter((wine) => type === 'All' || wine.type === type);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Wine List</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Selections by the glass and bottle.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {TYPES.map((item) => (
              <button
                key={item}
                onClick={() => setType(item)}
                className={`tab ${type === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">{visible.length} wines</p>
        </div>

        <div className="flex flex-col gap-3">
          {visible.map((wine) => (
            <div
              key={wine.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body flex-row items-center justify-between gap-3 p-5">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{wine.name}</p>
                    {wine.pick && (
                      <span className="badge badge-warning badge-sm">
                        Sommelier pick
                      </span>
                    )}
                  </div>
                  <p className="text-base-content/50 text-xs">{wine.region}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-base-content/50">{wine.vintage}</span>
                  <span className="flex items-center gap-1 font-semibold">
                    <FiAward className="h-3.5 w-3.5" />${wine.price}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

WineListTemplate.displayName = 'WineListTemplate';
